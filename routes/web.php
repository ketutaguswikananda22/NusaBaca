<?php

use App\Http\Controllers\{
    ProfileController, DashboardController, BookController, 
    LibraryController, WriterApplicationController, BookPartController, 
    RatingController, ReportController, AdminController, 
    PostController, GenreController, AuthorController, BookHistoryController
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
    });

    Route::post('/notifications/mark-all-read', function () {
        Auth::user()->unreadNotifications->markAsRead();
        return back();
    })->name('notifications.markAllRead');

    // --- Book & Dashboard ---
    Route::get('/dashboard', [BookController::class, 'index'])->name('dashboard');
    Route::get('/my-works', [BookController::class, 'myWorks'])->name('author.books');
    Route::get('/library', [DashboardController::class, 'library'])->name('library.index');
    
    Route::resource('books', BookController::class)->except(['index']);
    Route::get('/books/{id}/read/{part_id}', [BookController::class, 'read'])->name('books.read');

    /*
    |--------------------------------------------------------------------------
    | Admin System Layer (Fixed & Synced)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        // Dashboard Admin & Moderation
        Route::get('/', [AdminController::class, 'index'])->name('index');
        Route::get('/moderation', [AdminController::class, 'moderationIndex'])->name('moderation');
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        // TAMBAHKAN INI: Memperbaiki error di image_a0482a.png agar tidak muter terus
        Route::patch('/reports/{id}', [ReportController::class, 'update'])->name('reports.update');
        
        // --- USER MANAGEMENT (SINKRON DENGAN AuthorManagement.jsx) ---
        // Menggunakan PATCH karena di JSX baris 17: router.patch(...)
        // Menggunakan nama 'users.toggle' karena di JSX baris 17: route('admin.users.toggle')
        Route::patch('/users/{id}/toggle', [AdminController::class, 'toggleUserStatus'])->name('users.toggle');
        Route::patch('/users/{id}/unban', [AdminController::class, 'unban'])->name('users.unban');
        
        // --- CONTENT MANAGEMENT ---
        Route::post('/books/{id}/reject', [AdminController::class, 'rejectBook'])->name('books.reject');
        
        // --- RESOURCES ---
        Route::resource('genres', GenreController::class);
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/writer-applications', [WriterApplicationController::class, 'adminIndex'])->name('writer.applications');
    });
});

require __DIR__.'/auth.php';