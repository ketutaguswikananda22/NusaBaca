<?php

namespace App\Http\Controllers;

use App\Models\{Book, User, WriterApplication, Report, AuditLog};
use App\Events\{AuditUpdated, SystemStatusUpdated};
use App\Services\SystemService;
use App\Mail\BookRejectedMail;
use Illuminate\Http\{Request, RedirectResponse};
use Illuminate\Support\Facades\{DB, Mail, Storage};
use Inertia\Inertia;
use Carbon\Carbon;

class AdminController extends Controller
{
    protected $systemService;

    public function __construct(SystemService $systemService)
    {
        $this->systemService = $systemService;
    }

    /**
     * Helper: Transform Book Data (DRY Principle)
     */
    private function transformBook($book): array
    {
        return [
            'id' => $book->id,
            'title' => $book->title,
            'description' => $book->description,
            'cover_path' => $book->cover_path 
                ? asset('storage/' . $book->cover_path) 
                : asset('images/default-cover.jpg'),
            'user' => [
                'name' => $book->user->name ?? 'Anonim'
            ],
        ];
    }

    public function index()
    {
        $books = Book::with('user')->where('status', 'pending')->latest()->get()
            ->map(fn($b) => $this->transformBook($b));

        $authors = User::whereIn('role', ['penulis', 'admin'])
            ->select('id', 'name', 'email', 'points', 'status', 'is_banned', 'avatar')
            ->latest()->get()
            ->map(function ($auth) {
                $auth->points = (int) ($auth->points ?? 0);
                if ($auth->avatar && !str_starts_with($auth->avatar, 'http')) {
                    $auth->avatar = asset('storage/' . $auth->avatar);
                }
                return $auth;
            });

        $reportStats = Report::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as total'))
            ->where('created_at', '>=', Carbon::now()->subDays(6))
            ->groupBy('date')->orderBy('date', 'ASC')->get();

        // Trigger System Check via Service
        event(new SystemStatusUpdated($this->systemService->getSystemHealth()));

        return Inertia::render('Admin/AdminDashboard', [
            'books' => $books,
            'authors' => $authors,
            'auditLogs' => AuditLog::latest()->take(6)->get(),
            'reportChartData' => $reportStats,
            'statusStats' => [
                'pending' => Report::where('status', 'pending')->count(),
                'resolved' => Report::where('status', 'resolved')->count(),
            ],
            'stats' => [
                'pendingAuthors' => WriterApplication::where('status', 'pending')->count(),
                'totalBooks' => Book::count(),
                'totalUsers' => User::count(),
            ]
        ]);
    }

    public function moderationIndex()
    {
        return Inertia::render('Admin/Moderation', [
            'books' => Book::with('user')->where('status', 'pending')->latest()->get()
                ->map(fn($b) => $this->transformBook($b)),
            'auditLogs' => AuditLog::latest()->take(6)->get(),
        ]);
    }

    public function toggleUserStatus($id): RedirectResponse
{
    $user = User::findOrFail($id);
    $isSuspending = $user->status === 'active';

    $user->update([
        'status' => $isSuspending ? 'suspended' : 'active',
        'is_banned' => $isSuspending,
    ]);

    // --- TAMBAHKAN INI: System Behavior Layer (Notification) ---
    $user->notify(new \App\Notifications\AktivitasNotifikasi([
        'title'   => $isSuspending ? 'Akun Ditangguhkan' : 'Akun Diaktifkan',
        'message' => $isSuspending 
            ? 'Akun Anda telah ditangguhkan karena pelanggaran kebijakan.' 
            : 'Selamat! Akun Anda telah aktif kembali. Silakan berkarya lagi.',
        'type'    => $isSuspending ? 'danger' : 'success',
        'url'     => route('dashboard'),
    ]));

    // Audit Log untuk Dashboard Admin (Sudah benar)
    $log = AuditLog::create([
        'action_name' => $isSuspending ? 'USER SUSPENDED' : 'USER ACTIVE',
        'details' => "Admin mengubah status {$user->name} menjadi {$user->status}.",
        'type' => $isSuspending ? 'danger' : 'success',
    ]);

    broadcast(new AuditUpdated($log));

    // Gunakan with('error_suspended') jika sedang suspend agar bisa ditangkap di Login Page
    if ($isSuspending) {
        return back()->with('error_suspended', 'User berhasil ditangguhkan.');
    }

    return back()->with('success', "Status {$user->name} diperbarui.");
}

    public function rejectBook(Request $request, $id): RedirectResponse
    {
        $request->validate(['reason' => 'required|string']);
        $book = Book::with('user')->findOrFail($id);

        $book->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason
        ]);

        if ($book->user) {
            // Notification behavior
            $book->user->notify(new \App\Notifications\BookStatusNotification($book, 'rejected', $request->reason));
            
            if ($book->user->email) {
                Mail::to($book->user->email)->send(new BookRejectedMail($book, $request->reason));
            }
        }

        broadcast(new AuditUpdated(AuditLog::create([
            'action_name' => 'BOOK REJECTED',
            'details' => "Buku '{$book->title}' ditolak: {$request->reason}",
            'type' => 'danger',
        ])));

        return back()->with('success', 'Buku ditolak.');
    }

    public function unban($id)
    {
        User::findOrFail($id)->update(['is_banned' => false, 'status' => 'active']);
        return back();
    }
}