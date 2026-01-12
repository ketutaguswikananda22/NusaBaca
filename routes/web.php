<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\WriterApplicationController;
use App\Http\Controllers\BookPartController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\GenreController;
use App\Models\Book;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

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
| Google Authentication
|--------------------------------------------------------------------------
*/

Route::get('/auth/google', fn() => Socialite::driver('google')->redirect())->name('google.login');

Route::get('/auth/google/callback', function () {
    try {
        $googleUser = Socialite::driver('google')->user();
        $user = User::updateOrCreate(
            ['email' => $googleUser->email],
            [
                'google_id' => $googleUser->id,
                'name' => $googleUser->name,
                'password' => $user->password ?? bcrypt(str()->random(16)),
                'email_verified_at' => now(),
                'role' => ($googleUser->email == 'nusabacaa@gmail.com') ? 'admin' : ($user->role ?? 'user'),
            ]
        );

        // Auto-check writer status
        $isApproved = DB::table('writer_applications')->where('user_id', $user->id)->where('status', 'approved')->exists();
        if ($isApproved && $user->role !== 'admin') {
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
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // --- Notifications System ---
    Route::controller(ProfileController::class)->group(function () {
        Route::get('/notifications', 'notifications')->name('notifications.index');
    });
    Route::get('/history-laporan', [ReportController::class, 'history'])->name('reports.history');
    Route::post('/notifications/{id}/read', function ($id) {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $notification = $user->notifications()->findOrFail($id);
        $notification->markAsRead();
        return redirect($notification->data['url'] ?? '/dashboard');
    })->name('notifications.read');

    Route::post('/notifications/mark-all-read', function () {
        Auth::user()->unreadNotifications->markAsRead();
        return back();
    })->name('notifications.markAllRead');

    Route::get('/contact-support', fn() => redirect()->route('dashboard'))->name('contact.support');

    // --- Dashboard & Library ---
    Route::get('/dashboard', [BookController::class, 'index'])->name('dashboard');
    Route::get('/library', [DashboardController::class, 'library'])->name('library.index');
    Route::post('/library/toggle/{bookId}', [LibraryController::class, 'toggle'])->name('library.toggle');
    Route::post('/reports', [ReportController::class, 'store'])->name('reports.user');

    // --- Book Management ---
    Route::get('/karya-saya', [BookController::class, 'myWorks'])->name('author.books');
    Route::resource('books', BookController::class)->except(['index']); // Menggunakan resource agar lebih rapi
    
    // --- Writing & Social ---
    Route::get('/books/{book}/parts/create', [BookPartController::class, 'create'])->name('parts.create');
    Route::post('/books/{book}/parts', [BookPartController::class, 'store'])->name('parts.store');
    Route::post('/books/{book}/rate', [RatingController::class, 'store'])->name('books.rate');
    Route::get('/books/{id}/read/{part_id}', [BookController::class, 'read'])->name('books.read');

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
        Route::post('/user/{id}/conversation', 'storeConversation')->name('conversation.store');
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('index');
        
        // Reports
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::delete('/reports/{id}', [ReportController::class, 'destroy'])->name('reports.destroy');
        Route::patch('/reports/{id}', [ReportController::class, 'update'])->name('reports.update');
        
        
        // Moderation
        Route::get('/moderation', [AdminController::class, 'moderationIndex'])->name('moderation');
        Route::post('/books/{id}/approve', [BookController::class, 'approve'])->name('books.approve');
        Route::post('/books/{id}/reject-action', [AdminController::class, 'rejectBook'])->name('books.reject.action');
        
        // Genres
        Route::resource('genres', GenreController::class);

        // Users & Writers
        Route::get('/writer-applications', [WriterApplicationController::class, 'adminIndex'])->name('writer.applications');
        Route::post('/writer-applications/{id}', [WriterApplicationController::class, 'updateStatus'])->name('writer.updateStatus');
        Route::post('/users/{id}/toggle', [AdminController::class, 'toggleUserStatus'])->name('users.toggle');
        Route::patch('/users/{id}/unban', [AdminController::class, 'unban'])->name('users.unban');
    });
});

require __DIR__.'/auth.php';