<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BookHistoryController extends Controller
{
    /**
     * Menampilkan riwayat status buku milik penulis.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Mengambil buku milik user yang sedang login
        $books = Book::where('user_id', Auth::id())->get()
            ->latest()
            ->paginate(10);
        
        return Inertia::render('Author/BookHistory', [
            'books' => $books
        ]);
    }
}