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
use App\Http\Controllers\AuthorController;
use App\Events\SystemStatusUpdated;
use App\Http\Controllers\BookHistoryController;
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
Route::get('author/book-history', [BookHistoryController::class, 'index'])
    ->middleware(['auth'])
    ->name('author.book_history');

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

Route::get('/tes-error', function () {
    event(new \App\Events\SystemStatusUpdated([
        'api' => 'OFFLINE',
        'operational' => 'DOWN',
        'db' => 'CRITICAL',
        'storage' => 'FULL'
    ]));
    return "Semua status dikirim!";
});

Route::get('/tes-normal', function () {
    event(new SystemStatusUpdated([
        'api' => 'OPTIMAL',
        'db' => 'HEALTHY',
        'storage' => 'AVAILABLE',
        'storage_percentage' => 10
    ]));
    return "Sinyal NORMAL dikirim!";
});

Route::get('/tes-full', function () {
    event(new \App\Events\SystemStatusUpdated([
        'api' => 'OPTIMAL',
        'db' => 'HEALTHY',
        'storage' => 'WARNING',
        'storage_percentage' => 85
    ]));
    return "Simulasi Storage 85% terkirim!";
});

// Cek apakah Ziggy dan Laravel mengenali nama rute ini
Route::get('/debug-route', function () {
    return [
        'url_generated' => route('author.book_history'),
        'all_routes' => collect(Route::getRoutes())->map(function ($r) {
            return $r->uri();
        })->contains('author/book-history') ? 'ADA' : 'TIDAK ADA',
    ];
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

    // Author/Writer Routes
    Route::get('/my-works', [App\Http\Controllers\BookController::class, 'myWorks'])
        ->name('author.books'); 

    // 2. Rute untuk Notifikasi (Riwayat Buku) - Sesuai keinginanmu
    Route::get('/author/book-history', [App\Http\Controllers\BookHistoryController::class, 'index'])
        ->name('author.book_history');
    
    Route::get('/settings/profile', function() {
        return redirect()->route('reports.history');
    });

    // --- Notifications System ---
    Route::controller(ProfileController::class)->group(function () {
        Route::get('/notifications', 'notifications')->name('notifications.index');
    });
    
    Route::get('/history-laporan', [ReportController::class, 'history'])->name('reports.history');

    // Perbaikan Logika Read & Redirect
    Route::post('/notifications/{id}/read', function ($id) {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $notification = $user->notifications()->findOrFail($id);
        $notification->markAsRead();

        $data = $notification->data;
        $title = $data['title'] ?? '';
        $url = $data['url'] ?? '/dashboard';

        // Logika khusus untuk Penulis
        if ($user->role === 'penulis') {
            // Jika notifikasi tentang update buku, arahkan ke Riwayat Buku
            if (str_contains(strtolower($title), 'buku') || str_contains(strtolower($title), 'karya')) {
                return redirect()->route('author.book_history');
            }
            // Jika notifikasi peringatan akun atau ke arah profile, arahkan ke Riwayat Laporan
            if (str_contains(strtolower($title), 'peringatan') || str_contains($url, 'profile')) {
                return redirect()->route('reports.history');
            }
        }

        return redirect($url);
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
    Route::resource('books', BookController::class)->except(['index']);
    
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
        Route::post('/user/{id}/conversation', 'storeConversation')->name('messages.store');
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
        Route::patch('/users/{id}/toggle', [AdminController::class, 'toggleUserStatus'])->name('users.toggle');
        Route::patch('/users/{id}/unban', [AdminController::class, 'unban'])->name('users.unban');
    });
});

require __DIR__.'/auth.php';