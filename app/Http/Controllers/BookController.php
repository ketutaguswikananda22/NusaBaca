<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\User;
use App\Models\Report;
use App\Models\Library;
use App\Models\BookPart;
use App\Models\Rating;
use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookStatusNotification;
use Illuminate\Support\Facades\Log;

class BookController extends Controller
{
    /**
     * FUNGSI BARU: Untuk memperbaiki path gambar yang berantakan di database.
     * Fungsi ini memastikan semua path diarahkan ke folder 'storage/books/covers/'
     */
  private function formatCoverPath($path)
{
    if (!$path) return asset('image/default-cover.jpg');

    if (filter_var($path, FILTER_VALIDATE_URL)) {
        return $path;
    }

    // Bersihkan path awal
    $cleanPath = trim($path, '/');
    $cleanPath = preg_replace('/^(storage|public)\//', '', $cleanPath);

    // CEK FOLDER:
    // Jika path diawali 'covers/' tapi belum ada 'books/' di depannya
    if (str_starts_with($cleanPath, 'covers/')) {
        $cleanPath = 'books/' . $cleanPath;
    } 
    // Jika path polos (langsung nama file), asumsikan ada di folder lengkap
    else if (!str_starts_with($cleanPath, 'covers/')) {
        $cleanPath = 'books/' . $cleanPath;
    }
    else {
        $cleanPath = 'books/covers' . $cleanPath;
    }

    return asset('storage/' . $cleanPath);
}

    public function index()
    {
        $books = Book::with('user')
            ->withAvg('ratings', 'rating')
            ->withCount('ratings')
            ->where('status', 'published')
            ->latest()
            ->get()
            ->map(function ($book) {
                // Gunakan fungsi format baru di sini
                $book->cover_path = $this->formatCoverPath($book->cover_path);
                $book->average_rating = $book->ratings_avg_rating ? number_format($book->ratings_avg_rating, 1) : '0.0';
                return $book;
            });

        return Inertia::render('Dashboard', [
            'books' => $books,
            'genres' => Genre::all(),
        ]);
    }

   public function store(Request $request)
{
    $request->validate([
        'title'       => 'required|string|max:255',
        'description' => 'required|string',
        'genre'       => 'required|array|min:1',
        'cover'       => 'required|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    return DB::transaction(function () use ($request) {
        $path = $request->file('cover')->store('books/covers', 'public');

        $book = Book::create([
            'user_id'    => Auth::id(),
            'title'      => $request->title,
            'description' => $request->description,
            'genre'      => $request->genre, 
            'cover_path' => $path,
            'file_path' => 'default_file_path',
            'status'     => 'pending',
        ]);
        
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->increment('points', 10);

        $user->notify(new \App\Notifications\BookStatusNotification($book, 'pending', 'user'));

        try {
            // Email ke Penulis dan Admin
            Mail::to($user->email)->send(new BookStatusNotification($book, 'pending'));
            $adminEmail = 'nusabacaa@gmail.com'; 
            Mail::to($adminEmail)->send(new BookStatusNotification($book, 'admin_notification'));
            Log::info("Email Store: Berhasil dikirim.");
        } catch (\Exception $e) {
            Log::error("Email Store: Gagal kirim email. " . $e->getMessage());
        }

        return redirect()->route('author.books')->with('message', 'Karya berhasil dikirim!');
    }); // <--- WAJIB ADA INI UNTUK MENUTUP DB::transaction
} // <--- WAJIB ADA INI UNTUK MENUTUP function store

    public function edit($id)
    {
        $book = Book::findOrFail($id);
        
        
        if ($book->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('Books/Edit', [
            'book' => [
                'id' => $book->id,
                'title' => $book->title,
                'description' => $book->description,
                'genre' => is_array($book->genre) ? $book->genre : json_decode($book->genre, true) ?? [],
                'cover_path' => $this->formatCoverPath($book->cover_path),
            ],
            'genres' => Genre::all(),
        ]);
    }

    public function destroy($id)
    {
    try {
        $book = Book::findOrFail($id);
        
        /** @var \App\Models\User $user */
        $user = Auth::user(); 

        // PERBAIKAN: Gunakan variabel $user yang didefinisikan di atas, 
        if ($user->id !== $book->user_id && $user->role !== 'admin') {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses.');
        }

        // 1. Hapus semua laporan yang merujuk ke buku ini agar tidak error foreign key
        \App\Models\Report::where('book_id', $id)->delete();

        // 2. Hapus dari library user lain
        \Illuminate\Support\Facades\DB::table('libraries')->where('book_id', $id)->delete();

        // 3. Hapus file cover dari storage jika ada
        if ($book->cover_path && \Illuminate\Support\Facades\Storage::exists('public/' . $book->cover_path)) {
            \Illuminate\Support\Facades\Storage::delete('public/' . $book->cover_path);
        }

        // 4. Hapus bukunya
        $book->delete();

        return redirect()->route('dashboard')->with('success', 'Buku dan data terkait berhasil dihapus.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus buku: ' . $e->getMessage());
        }
    }

    public function myWorks()
    {
        if (!in_array(Auth::user()->role, ['penulis', 'admin'])) {
            return redirect()->route('dashboard');
        }

        $myBooks = Book::where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($book) {
                $book->cover_path = $this->formatCoverPath($book->cover_path);
                return $book;
            });

        return Inertia::render('Author/MyWorks', [
            'books' => $myBooks,
            'genres' => Genre::all(),
        ]);
    }
    
    public function show($id)
    {
        Book::where('id', $id)->increment('views');

        $book = Book::with(['user', 'parts', 'ratings.user']) 
            ->withAvg('ratings', 'rating')
            ->withCount('ratings')
            ->findOrFail($id);

        $bookData = $book->toArray();
        $bookData['cover_path'] = $this->formatCoverPath($book->cover_path);
        $bookData['genre'] = is_array($book->genre) ? $book->genre : json_decode($book->genre, true) ?? [];

        return Inertia::render('Books/Show', [
            'book' => $bookData,
            'initialIsInLibrary' => Auth::check() ? Library::where('user_id', Auth::id())->where('book_id', $id)->exists() : false
        ]);
    }

    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        if ($book->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            abort(403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'genre' => 'required|array',
            'cover' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', 
        ]);

        $updateData = [
            'title' => $request->title,
            'description' => $request->description,
            'genre' => $request->genre,
        ];

        if ($request->hasFile('cover')) {
            if ($book->cover_path) {
                Storage::disk('public')->delete($book->cover_path);
            }
            $updateData['cover_path'] = $request->file('cover')->store('books/covers', 'public');
        }

        $book->update($updateData);

        return redirect()->route('author.books')->with('message', 'Karya diperbarui!');
    }

    public function create()
    {
        if (!in_array(Auth::user()->role, ['penulis', 'admin'])) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Books/Create', [
            'genres' => Genre::all(),
        ]);
    }


public function approve($id)
{
    if (Auth::user()->role !== 'admin') {
        abort(403);
    }

    $book = Book::with('user')->findOrFail($id);
    if ($book->status === 'published') {
        return redirect()->back()->with('error', 'Buku sudah diterbitkan');
    }
    return DB::transaction(function () use ($book) {
        $book->update(['status' => 'published']);

        if ($book->user) {
            $book->user->increment('points', 100);
            $book->user->notify(new \App\Notifications\BookStatusNotification($book, 'published', 'user'));
        }
        $log = \App\Models\AuditLog::create([
            'action_name' => 'BOOK APPROVED',
            'details' => "Buku `{$book->title}` telah diterbitkan, Penulis ({$book->user->name}) mendapat +100 point.",
            'type' => 'success',
        ]);

        broadcast(new \App\Events\AuditUpdated($log));

        try {
            Mail::to($book->user->email)->send(new BookStatusNotification($book, 'published'));
        } catch (\Exception $e) {
            Log::error("Email Approve Gagal: " . $e->getMessage());
        }
        return redirect()->back()->with('message', 'Buku telah berhasil di terbitkan');
    });

}

    public function read($id, $part_id)
{
    $book = Book::findOrFail($id);

    $part = BookPart::where('book_id', $id)
        ->where('id', $part_id)
        ->firstOrFail();

    $prevPart = BookPart::where('book_id', $id)
        ->where('id', '<', $part_id)
        ->orderBy('id', 'desc')
        ->first();

    $nextPart = BookPart::where('book_id', $id)
        ->where('id', '>', $part_id)
        ->orderBy('id', 'asc')
        ->first();

    return Inertia::render('Books/Read', [
        'book' => $book,
        'part' => $part, // Menggunakan 'part' agar sesuai dengan { part.title } di React
        'prev_part_id' => $prevPart ? $prevPart->id : null,
        'next_part_id' => $nextPart ? $nextPart->id : null,
    ]);
}

    public function katalog(Request $request) 
    {
        $search = $request->input('search');

        $books = Book::with('user')
            ->where('status', 'published')
            ->when($search, function ($query, $search) {
                return $query->where('title', 'like', '%' . $search . '%');
            })
            ->latest()
            ->get()
            ->map(function ($book) {
                $book->cover_path = $this->formatCoverPath($book->cover_path);
                $book->genre = is_array($book->genre) ? $book->genre : json_decode($book->genre, true) ?? [];
                return $book;
            });

        return Inertia::render('Katalog', [
            'books' => $books,
            'filters' => $request->only(['search'])
        ]);
    }
}