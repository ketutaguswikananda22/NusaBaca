<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\WriterApplicationController;
use App\Http\Controllers\BookPartController;
use App\Http\Controllers\RatingController;
use App\Models\Book;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    $recentBooks = Book::with('user')
        ->where('status', 'published') 
        ->latest()                     
        ->take(4)                      
        ->get()
        ->map(function ($book) {
            if ($book->cover_path && !str_starts_with($book->cover_path, 'http')) {
                $book->cover_path = asset('storage/' . $book->cover_path);
            }
            return $book;
        });

    return Inertia::render('Welcome', [
        'recentBooks' => $recentBooks,
    ]);
});

Route::get('/katalog', [BookController::class, 'katalog'])->name('katalog.index');
Route::get('/author/{id}', [ProfileController::class, 'showPublicProfile'])->name('author.profile');

/*
|--------------------------------------------------------------------------
| Google Authentication Routes
|--------------------------------------------------------------------------
*/

Route::get('/auth/google', function () {
    return Socialite::driver('google')->redirect();
})->name('google.login');

Route::get('/auth/google/callback', function () {
    try {
        $googleUser = Socialite::driver('google')->user();
        $user = User::where('email', $googleUser->email)->first();

        if ($user) {
            $user->update([
                'google_id' => $googleUser->id,
                'name' => $googleUser->name,
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        } else {
            $user = User::create([
                'email' => $googleUser->email,
                'name' => $googleUser->name,
                'password' => bcrypt(str()->random(16)),
                'email_verified_at' => now(),
                'google_id' => $googleUser->id,
                'role' => ($googleUser->email == 'nusabacaa@gmail.com') ? 'admin' : 'user',
            ]);
        }

        $isApprovedWriter = DB::table('writer_applications')
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->exists();

        if ($isApprovedWriter && $user->role !== 'admin') {
            $user->update(['role' => 'penulis']);
        }

        Auth::login($user);
        request()->session()->regenerate();

        return redirect()->intended('/dashboard');

    } catch (\Exception $e) {
        return redirect('/login')->with('error', 'Gagal login menggunakan Google');
    }
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Auth & Verified)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // --- Dashboard & Library ---
    Route::get('/dashboard', [BookController::class, 'index'])->name('dashboard');
    Route::get('/library', [DashboardController::class, 'library'])->name('library.index');
    Route::post('/library/toggle/{bookId}', [LibraryController::class, 'toggle'])->name('library.toggle');
    //report
    Route::post('/reports', [ReportController::class, 'store'])->name('reports.user');

    // --- Book Management (CRUD) ---
    Route::get('/karya-saya', [BookController::class, 'myWorks'])->name('author.books');
    Route::get('/books/create', [BookController::class, 'create'])->name('books.create');
    Route::post('/books/store', [BookController::class, 'store'])->name('books.store');
    Route::get('/books/{id}', [BookController::class, 'show'])->name('books.show'); 
    Route::get('/books/{id}/edit', [BookController::class, 'edit'])->name('books.edit');
    Route::put('/books/{id}/update', [BookController::class, 'update'])->name('books.update');
    Route::delete('/books/{id}', [BookController::class, 'destroy'])->name('books.destroy');
    
    // --- Reading, Parts & Ratings ---
    Route::get('/books/{id}/read/{part_id}', [BookController::class, 'read'])->name('books.read');
    Route::get('/books/{book}/parts/create', [BookPartController::class, 'create'])->name('parts.create');
    Route::post('/books/{book}/parts', [BookPartController::class, 'store'])->name('parts.store');
    Route::post('/books/{book}/rate', [RatingController::class, 'store'])->name('books.rate');

    // --- Writer Application ---
    Route::get('/join-writer', [WriterApplicationController::class, 'index'])->name('writer.join');
    Route::post('/join-writer', [WriterApplicationController::class, 'store'])->name('writer.store');

    // --- Profile Management ---
    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
        Route::post('/profile/avatar', 'updateAvatar')->name('profile.avatar.update');
        Route::delete('/profile/avatar', 'destroyAvatar')->name('profile.avatar.destroy');
        Route::post('/profile/update-full', 'updateFullProfile')->name('profile.update.full');
        Route::post('/profile/follow/{user}', 'follow')->name('profile.follow');
        Route::post('/profile/unfollow/{user}', 'unfollow')->name('profile.unfollow');
    });

    // --- Social Interactions ---
    Route::post('/follow/{id}', [ProfileController::class, 'follow'])->name('follow.action');
    Route::post('/unfollow/{id}', [ProfileController::class, 'unfollow'])->name('unfollow.action');
    Route::post('/user/{id}/conversation', [ProfileController::class, 'storeConversation'])->name('conversation.store');

    // --- Admin Routes (VERSI FIX) ---
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    
    // 1. Dashboard Utama
    Route::get('/', [App\Http\Controllers\AdminController::class, 'index'])->name('index');

    // 2. Report Management
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::delete('/reports/{id}', [ReportController::class, 'destroy'])->name('reports.destroy');
    Route::patch('/reports/{id}', [ReportController::class, 'update'])->name('reports.update');
    Route::post('/admin/books/{id}/reject', [App\Http\Controllers\AdminController::class, 'rejectBook'])->name('admin.books.reject');
    
    // 3. Moderasi Buku
    Route::get('/moderation', [App\Http\Controllers\AdminController::class, 'moderationIndex'])->name('moderation');
    Route::post('/books/{id}/approve', [BookController::class, 'approve'])->name('books.approve');
    Route::delete('/books/{id}/reject', [BookController::class, 'destroy'])->name('books.reject');

    // 4. Manajemen Genre
    Route::get('/genres', [App\Http\Controllers\GenreController::class, 'index'])->name('genres.index');
    Route::post('/genres', [App\Http\Controllers\GenreController::class, 'store'])->name('genres.store');
    Route::patch('/genres/{genre}', [App\Http\Controllers\GenreController::class, 'update'])->name('genres.update');
    Route::delete('/genres/{genre}', [App\Http\Controllers\GenreController::class, 'destroy'])->name('genres.destroy');

    // 5. Manajemen User & Penulis
    Route::get('/writer-applications', [WriterApplicationController::class, 'adminIndex'])->name('writer.applications');
    Route::post('/writer-applications/{id}', [WriterApplicationController::class, 'updateStatus'])->name('writer.updateStatus');
    Route::post('/users/{id}/toggle', [App\Http\Controllers\AdminController::class, 'toggleUserStatus'])->name('users.toggle');
    });
});

require __DIR__.'/auth.php';