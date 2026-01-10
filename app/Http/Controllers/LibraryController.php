<?php

namespace App\Http\Controllers;

use App\Models\Library;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LibraryController extends Controller
{
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