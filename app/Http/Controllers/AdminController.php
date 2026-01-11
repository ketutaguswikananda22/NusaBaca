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
    return Inertia::render('Admin/Edit', [
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
        return inertia('Admin/Moderation', [
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

}