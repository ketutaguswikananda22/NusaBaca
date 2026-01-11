<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\User;
use App\Models\WriterApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Report;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Mail\BookRejectedMail; // Class Mailable yang baru kita buat
use Illuminate\Support\Facades\Mail; // Facade untuk mengirim email


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
    return Inertia::render('Admin/Moderation', [
        'books' => $books,
        'reportChartData' => [
        // Ambil label hari dari database, jika kosong kirim array kosong []
            'labels' => $reportStats->pluck('date')->map(fn($date) => \Carbon\Carbon::parse($date)->format('D')),
            // Ambil total angka dari database, jika kosong kirim array kosong []
            'totals' => $reportStats->pluck('total'),
        ],
        'statusStats' => $statusStats, 
        'auth' => ['user' => auth()->user()]
    ]);
}

    public function toggleUserStatus($id)
    {
        $user = User::findOrFail($id);
        $user->status = ($user->status === 'active') ? 'suspended' : 'active';
        $user->save();

        return back();
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
        'auth' => ['user' => auth()->user()]
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
}