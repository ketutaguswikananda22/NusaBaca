<?php

namespace App\Http\Controllers;

use App\Events\AuditUpdated;
use App\Events\SystemStatusUpdated;
use Illuminate\Support\Facades\File;
use App\Models\Book;
use App\Models\User;
use App\Models\WriterApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Report;
use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Mail\BookRejectedMail; // Class Mailable yang baru kita buat
use Illuminate\Support\Facades\Mail; // Facade untuk mengirim email
use Illuminate\Support\Facades\Storage;


class AdminController extends Controller
{

public function index()
{
    $books = Book::with('user')
        ->where('status', 'pending')
        ->latest()
        ->get()
        ->map(function ($book) {
            return [
                'id' => $book->id,
                'title' => $book->title,
                'description' => $book->description, 
                'cover_path' => $book->cover_path ? asset('storage/' . $book->cover_path) : asset('images/default-cover.jpg'),
                'user' => [
                    'name' => $book->user->name ?? 'Anonim'
                ],
            ];
        });

    $reportStats = Report::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as total'))
        ->where('created_at', '>=', Carbon::now()->subDays(6))
        ->groupBy('date')
        ->orderBy('date', 'ASC')
        ->get();
    
    $statusStats = [
        'pending' => Report::where('status', 'pending')->count(),
        'resolved' => Report::where('status', 'resolved')->count(),
    ];

    $this->checkSystem();

    return Inertia::render('Admin/AdminDashboard', [
        'books' => $books,
        'auditLogs' => \App\Models\AuditLog::latest()->take(6)->get(),
        'reportChartData' => [/*....*/],
        'statusStats' => $statusStats, 
        'auth' => ['user' => auth()->user()]
    ]);
}

    public function toggleUserStatus($id)
    {
        $user = User::findOrFail($id);

        if ($user->status === 'active') {
            $user->status = 'suspended';
            $user->is_banned = true;
            $action = 'USER SUSPENDED';
            $type = 'danger';
        } else {
            $user->status = 'active';
            $user->is_banned = false;
            $action = 'USER ACTIVE';
            $type = 'success';
        }
        $user->save();
        $user->refresh();

        $log = AuditLog::create([
            'action_name' => $action,
            'details' => "Admin mengubah status akun {$user->name} menjadi {$user->status}.",
            'type' => $type,
        ]);

        broadcast(new \App\Events\AuditUpdated($log));

        return back()->with('success', 'Status akun ' . $user->name . ' berhasil diubah menjadi ' . $user->status);
    }

    public function moderationIndex()
{
    // Ambil logika yang sama dengan index() untuk menampilkan buku pending
    $books = Book::with('user')
        ->where('status', 'pending')
        ->latest()
        ->get()
        ->map(function ($book) {
            return [
                'id' => $book->id,
                'title' => $book->title,
                'description' => $book->description, 
                'cover_path' => $book->cover_path ? asset('storage/' . $book->cover_path) : asset('images/default-cover.jpg'),
                'user' => [
                    'name' => $book->user->name ?? 'Anonim'
                ],
            ];
        });

    return Inertia::render('Admin/Moderation', [
        'books' => $books,
        'auth' => ['user' => auth()->user()],
        'auditLogs' => \App\Models\AuditLog::latest()->take(6)->get(),
    ]);
    
}

    public function storeReport(Request $request)
{
    $request->validate([
        'book_id' => 'required|exists:books,id',
        'reason' => 'required|string',
    ]);

    Report::create([
        'user_id' => auth()->id(),
        'book_id' => $request->book_id,
        'reason' => $request->reason,
        'description' => $request->description,
    ]);

    return redirect()->back()->with('success', 'Laporan Anda telah dikirim.');
    }

    public function rejectBook(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string'
        ]);

        $book = Book::with('user')->findOrFail($id);

        $book->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason
        ]);

        // Kirim email ke penulis
        if ($book->user && $book->user->email) {
            Mail::to($book->user->email)->send(new BookRejectedMail($book, $request->reason));
        }

        $log = AuditLog::create([
            'action_name' => 'BOOK REJECTED',
            'details' => "Buku '{$book->title}' ditolak. Alasan: {$request->reason}",
            'type' => 'danger',
        ]);

        broadcast(new AuditUpdated($log));

        return back()->with('success', 'Buku telah ditolak dan email pemberitahuan dikirim.');
    }

    public function unban($id)
    {
        $user = User::findOrFail($id);
        $user->update([
            'is_banned' => false,
            'status' => 'active'
        ]);
        return back();
    }

    // AdminController.php atau sebuah Job/Command
    public function checkSystem()
{
    // 1. Tentukan Kuota Maksimal (Misal: 500MB dalam Bytes)
    $maxQuota = 500 * 1024 * 1024; 
    
    // 2. Hitung Ukuran Folder public/storage
    $storagePath = storage_path('app/public');
    $sizeInBytes = 0;
    
    if (File::exists($storagePath)) {
        foreach (File::allFiles($storagePath) as $file) {
            $sizeInBytes += $file->getSize();
        }
    }

    // 3. Hitung Persentase
    $percentage = ($sizeInBytes / $maxQuota) * 100;
    $percentage = min(round($percentage, 2), 100); // Maksimal 100%

    // 4. Tentukan Status Teks
    $statusText = $percentage >= 90 ? 'FULL' : ($percentage >= 70 ? 'WARNING' : 'AVAILABLE');

    $status = [
        'api' => 'OPTIMAL',
        'db' => DB::connection()->getPdo() ? 'HEALTHY' : 'DOWN',
        'storage' => $statusText,
        'storage_percentage' => $percentage, // Kirim angka ke frontend
    ];

    event(new SystemStatusUpdated($status));
}
}