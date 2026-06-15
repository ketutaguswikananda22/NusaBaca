<?php

use App\Http\Controllers\{
    ProfileController,
    DashboardController,
    BookController,
    LibraryController,
    WriterApplicationController,
    BookPartController,
    RatingController,
    ReportController,
    AdminController,
    PostController,
    GenreController,
    AuthorController,
    BookHistoryController
};
use App\Services\AuthService;
use App\Models\{Book, User};
use Illuminate\Support\Facades\{Route, Auth};
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    $recentBooks = Book::with('user')->where('status', 'published')->latest()->take(4)->get()
        ->map(function ($book) {
            if ($book->cover_path && !str_starts_with($book->cover_path, 'http')) {
                $book->cover_path = asset('storage/' . $book->cover_path);
            }
            return $book;
        });
    return Inertia::render('Welcome', ['recentBooks' => $recentBooks]);
});

Route::get('/katalog', [BookController::class, 'katalog'])->name('katalog.index');
Route::get('/author/{id}', [ProfileController::class, 'showPublicProfile'])->name('author.profile');

/*
|--------------------------------------------------------------------------
| Google Authentication
|--------------------------------------------------------------------------
*/
Route::get('/auth/google', fn() => Socialite::driver('google')->redirect())->name('google.login');
Route::get('/auth/google/callback', function (AuthService $authService) {
    try {
        $authService->handleGoogleCallback();
        return redirect()->intended('/dashboard');
    } catch (\Exception $e) {
        return redirect('/login')->with('error', 'Gagal login: ' . $e->getMessage());
    }
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    // Tambahkan route ini di dalam middleware auth
    Route::get('/notifications/{id}', [ProfileController::class, 'showNotification'])->name('notifications.show');

    Route::resource('parts', BookPartController::class);

    Route::post('/reports', [ReportController::class, 'store'])->name('reports.user');
    Route::get('/history-laporan', [ReportController::class, 'history'])->name('reports.history');

    // --- Writer Application ---
    Route::get('/join-writer', [WriterApplicationController::class, 'index'])->name('writer.join');
    Route::post('/join-writer', [WriterApplicationController::class, 'store'])->name('writer.store');

    // --- Profile & Notifications ---
    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
        Route::get('/notifications', 'notifications')->name('notifications.index');
        Route::post('/notifications/{id}/read', 'markRead')->name('notifications.read');

        // FIX: Menambahkan route follow yang dicari oleh Show.jsx di frontend
        // Route untuk Follow & Unfollow
        Route::post('/profile/{id}/follow', [App\Http\Controllers\ProfileController::class, 'follow'])->name('profile.follow');
        Route::post('/profile/{id}/unfollow', [App\Http\Controllers\ProfileController::class, 'unfollow'])->name('profile.unfollow');
        Route::post('/user/{id}/conversation', 'storeConversation')->name('profile.conversation');
    });

    Route::post('/notifications/mark-all-read', function () {
        Auth::user()->unreadNotifications->markAsRead();
        return back();
    })->name('notifications.markAllRead');

    // --- Book & Dashboard ---
    Route::get('/dashboard', [BookController::class, 'index'])->name('dashboard');
    Route::get('/my-works', [BookController::class, 'myWorks'])->name('author.books');
    Route::get('/library', [DashboardController::class, 'library'])->name('library.index');
    Route::post('/library/toggle/{bookId}', [LibraryController::class, 'toggle'])->name('library.toggle');

    Route::resource('books', BookController::class)->except(['index']);
    Route::get('/books/{id}/read/{part_id}', [BookController::class, 'read'])->name('books.read');

    /*
    |--------------------------------------------------------------------------
    | Admin System Layer
    |--------------------------------------------------------------------------
    */
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        // Dashboard Admin & Moderation
        Route::get('/', [AdminController::class, 'index'])->name('index');
        Route::get('/moderation', [AdminController::class, 'moderationIndex'])->name('moderation');
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::patch('/reports/{id}', [ReportController::class, 'update'])->name('reports.update');

        // --- USER MANAGEMENT ---
        Route::patch('/users/{id}/toggle', [AdminController::class, 'toggleUserStatus'])->name('users.toggle');
        Route::patch('/users/{id}/unban', [AdminController::class, 'unban'])->name('users.unban');

        // --- CONTENT MANAGEMENT ---
        Route::post('/books/{id}/reject', [AdminController::class, 'rejectBook'])->name('books.reject');

        // --- RESOURCES ---
        Route::resource('genres', GenreController::class);
        Route::get('/writer-applications', [WriterApplicationController::class, 'adminIndex'])->name('writer.applications');
        Route::post('/writer-applications/{id}/status', [WriterApplicationController::class, 'updateStatus'])->name('writer.updateStatus');
    });
});

require __DIR__ . '/auth.php';
