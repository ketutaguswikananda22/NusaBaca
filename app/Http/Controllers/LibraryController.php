<?php

namespace App\Http\Controllers;

use App\Models\Library;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Book;
use Inertia\Inertia;

class LibraryController extends Controller
{

    public function index()
{
    $userId = Auth::id();

    $books = Library::with(['book.user'])
        ->where('user_id', $userId)
        ->latest()
        ->get()
        ->map(function ($lib) {
            if (!$lib->book) return null;
            return [
                'id' => $lib->book->id,
                'library_id' => $lib->id,
                'title' => $lib->book->title,
                'author' => $lib->book->user->name ?? 'Unknown',
                'cover_path' => $lib->book->cover_path,
            ];
        })->filter()->values();

    return Inertia::render('Library/Index', [
        // BAGIAN APA: Ubah 'book' menjadi 'books'
        // MENGAPA: Agar sinkron dengan export default function Library({ auth, books })
        'books' => $books 
    ]);
}

 public function toggle($bookId)
{
    $userId = Auth::id();
    
    $library = Library::where('user_id', $userId)
                      ->where('book_id', $bookId)
                      ->first();

    if ($library) {
        $library->delete();
        return back()->with('message', 'Buku dihapus dari perpustakaan.')
                     ->with('type', 'error');
    } else {
        Library::create([
            'user_id' => $userId,
            'book_id' => $bookId,
        ]);
        
        return back()->with('message', 'Buku ditambahkan ke perpustakaan.')
                     ->with('type', 'success');
    }
}
}