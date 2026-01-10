<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\User;
use App\Models\WriterApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Report;

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
                // Tambahkan baris ini agar sinopsis terkirim ke React
                'description' => $book->description, 
                'cover_path' => $book->cover_path ? asset('storage/' . $book->cover_path) : asset('images/default-cover.jpg'),
                'user' => [
                    'name' => $book->user->name ?? 'Anonim'
                ],
            ];
        });

    return Inertia::render('Admin/Moderation', [
        'books' => $books,
        'auth' => [
            'user' => auth()->user()
        ]
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