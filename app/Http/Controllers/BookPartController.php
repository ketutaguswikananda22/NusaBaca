<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookPart;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookPartController extends Controller
{
    public function create($bookId)
    {
        $book = Book::findOrFail($bookId);
        return Inertia::render('Books/PartCreate', [
            'book' => $book
        ]);
    }

    public function store(Request $request, $bookId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required',
            'order' => 'required|integer',
        ]);

        BookPart::create([
            'book_id' => $bookId,
            'title' => $request->title,
            'content' => $request->content,
            'order' => $request->order,
        ]);

        return redirect()->route('books.show', $bookId)
                         ->with('message', 'Bab baru berhasil ditambahkan!');
    }

    
}