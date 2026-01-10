<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\User;
use App\Models\Genre;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $query = Book::with('user'); 

        if ($user->role === 'penulis') {
            $books = $query->where('user_id', $user->id)->latest()->get();
        } else {
            $books = $query->where('status', 'published')->latest()->get();
        }
        
        $genres = Genre::all();
        $stats = [
            'totalBooks' => Book::count(),
            'totalUsers' => User::whereIn('role', ['penulis', 'user'])->count(),
        ];

        // BERSIH: Tidak perlu kirim 'auth' lagi
        return Inertia::render('Dashboard', [
            'books' => $books,
            'genres' => $genres,
            'stats' => $stats,
        ]);
    }


    public function library()
    {
        $user = Auth::user();
        $libraryBooks = \App\Models\Library::where('user_id', $user->id)
            ->with(['book.user']) 
            ->latest()
            ->get()
            ->map(function ($item) {
                $book = $item->book;
                if ($book && $book->cover_path) {
                    $book->cover_path = asset('storage/' . $book->cover_path);
                }
                return $book;
            });

        return Inertia::render('Library', [
            'books' => $libraryBooks,
        ]);
    }
}