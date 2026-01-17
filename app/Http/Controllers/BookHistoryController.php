<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BookHistoryController extends Controller
{
    public function index()
{
    $books = Book::where('user_id', Auth::id())
        ->latest()
        ->paginate(10)
        ->through(function ($book) {
            // MENGAPA: Pastikan format cover_path konsisten dengan halaman lain
            return [
                'id' => $book->id,
                'title' => $book->title,
                'status' => $book->status,
                'rejection_reason' => $book->rejection_reason,
                'cover_path' => $book->cover_path ? asset('storage/' . $book->cover_path) : asset('images/default-cover.jpg'),
                'created_at' => $book->created_at->format('d M Y'),
            ];
        });
    
    return Inertia::render('Author/BookHistory', [
        'books' => $books
    ]);
}
}