<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Book;
use App\Models\User;
use App\Models\Message;
use App\Models\Genre;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProfileController extends Controller
{
    protected $notificationService;

    /**
     * Dependency Injection: Memasukkan Service ke dalam Controller
     */
    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Menangani klik notifikasi (Core Layer: Service Pattern)
     */
   public function markRead($id)
{
    $notification = auth()->user()->notifications()->findOrFail($id);
    $notification->markAsRead();

    // Mengambil URL dari data JSON notifikasi untuk redirect
    $url = $notification->data['url'] ?? route('dashboard');
    
    return redirect($url);
}

   /**
     * Menampilkan halaman edit profil (Private)
     */
    public function edit(Request $request)
    {
        $user = $request->user();

        // 1. Ambil data user beserta relasinya
        $userData = User::with([
            'books' => fn($q) => $q->where('status', 'published')->withCount('parts')->withAvg('ratings', 'rating')->latest(),
            'following',
            'followers',
            'readingLists.books'
        ])->withCount(['books', 'followers', 'following', 'readingLists'])
            ->findOrFail($user->id);

        // --- FIX: LOGIKA TOMBOL IKUTI/DIIKUTI ---
        // Ambil kumpulan ID dari orang-orang yang sedang kamu ikuti
        $followingIds = $userData->following->pluck('id')->toArray();

        // Cek satu-satu untuk tab "Pengikut" (Followers)
        if ($userData->followers) {
            $userData->followers->transform(function ($follower) use ($followingIds) {
                // Jika ID pengikut ada di dalam daftar orang yang kamu ikuti, berarti true
                $follower->is_followed = in_array($follower->id, $followingIds);
                return $follower;
            });
        }

        // Untuk tab "Mengikuti" (Following), otomatis true karena kamu memang mengikuti mereka
        if ($userData->following) {
            $userData->following->transform(function ($followingUser) {
                $followingUser->is_followed = true;
                return $followingUser;
            });
        }
        // ----------------------------------------

        $userData->points = (int) ($userData->points ?? 0);

        // 2. Ambil Percakapan
        $conversations = Message::where('user_id', $user->id)
            ->whereNull('parent_id')
            ->with(['sender', 'replies.sender'])
            ->latest()
            ->get()
            ->map(fn($msg) => $this->formatMessage($msg));

        // 3. Mapping path gambar cover buku
        $userData->books->transform(function ($book) {
            $book->cover_path = $book->cover_path
                ? (str_starts_with($book->cover_path, 'http') ? $book->cover_path : asset('storage/' . $book->cover_path))
                : null;
            return $book;
        });

        // 4. Daftar author lain (Saran Follow)
        // FIX NAMA @user: Kalau di database kamu punya kolom 'username', tambahkan di dalam select() di bawah ini. 
        // Contoh: ->select('id', 'name', 'username', 'email', ...)
        $authors = User::where('role', '!=', 'admin')
            ->where('id', '!=', $user->id)
            ->select('id', 'name', 'email', 'role', 'status', 'avatar', 'points')
            ->addSelect([
                'last_activity' => DB::table('sessions')
                    ->whereColumn('user_id', 'users.id')
                    ->select('last_activity')
                    ->orderBy('last_activity', 'desc')
                    ->limit(1)
            ])
            ->latest()
            ->get()
            ->map(function ($author) use ($user) {
                $author->is_followed = $user->following()->where('following_id', $author->id)->exists();
                $author->is_online = $author->last_activity && $author->last_activity > now()->subMinutes(5)->getTimestamp();
                $author->points = (int)($author->points ?? 0);
                return $author;
            });

        auth()->user()->touch();

        return Inertia::render('Profile/private/Edit', [
            'userData' => $userData,
            'conversations' => $conversations,
            'status' => session('status'),
            'authors' => $authors,
            'genres' => Genre::all(),
            'stats' => [
                'totalUsers' => (int) User::where('role', '!=', 'admin')->count(),
                'totalBooks' => (int) Book::count(),
                'pendingAuthors' => (int) User::where('role', 'user')->count(),
            ],
            'auditLogs' => \App\Models\AuditLog::latest()->take(4)->get(),
        ]);
    }

    /**
     * Helper untuk format message (Agar kode edit() tidak kepanjangan)
     */ 
    private function formatMessage($msg)
    {
        return [
            'id' => $msg->id,
            'message' => $msg->message,
            'created_at' => $msg->created_at,
            'user' => [
                'name' => $msg->sender->name ?? 'User',
                'avatar' => $msg->sender->avatar,
            ],
            'replies' => $msg->replies->map(fn($reply) => [
                'id' => $reply->id,
                'message' => $reply->message,
                'created_at' => $reply->created_at,
                'user' => [
                    'name' => $reply->sender->name ?? 'User',
                    'avatar' => $reply->sender->avatar,
                ]
            ])
        ];
    }

    public function showPublicProfile($id)
    {
        // 1. Ambil user yang sedang login saat ini
        $loggedInUser = Auth::user();
        $followingIds = $loggedInUser ? $loggedInUser->following()->pluck('id')->toArray() : [];

        // 2. Load data user profil yang dikunjungi BESERTA list followers & following-nya
        $user = User::with([
            'books' => fn($q) => $q->where('status', 'published')->withCount('parts'),
            'followers', // WAJIB: Biar data followers-nya gak kosong!
            'following'  // WAJIB: Biar data following-nya gak kosong!
        ])
            ->withCount(['followers', 'following'])
            ->findOrFail($id);

        if ($user->website) {
            $user->website_display = preg_replace('/(^https?:\/\/)/', '', $user->website);
        }

        // Status apakah user login mem-follow pemilik profil ini
        $user->is_followed = $loggedInUser ? $loggedInUser->following()->where('following_id', $id)->exists() : false;

        // 3. FIX MASALAH 2: Set status is_followed untuk masing-masing FOLLOWER-nya secara dinamis
        $user->followers->transform(function ($follower) use ($followingIds) {
            $follower->is_followed = in_array($follower->id, $followingIds);
            return $follower;
        });

        // Set status is_followed untuk masing-masing FOLLOWING-nya
        $user->following->transform(function ($followingUser) use ($followingIds) {
            $followingUser->is_followed = in_array($followingUser->id, $followingIds);
            return $followingUser;
        });

        $conversations = Message::where('user_id', $user->id)
            ->whereNull('parent_id')
            ->with(['sender', 'replies.sender'])
            ->latest()
            ->get()
            ->map(fn($msg) => $this->formatMessage($msg));

        return Inertia::render('Profile/public/Show', [
            'author' => $user,
            'books' => $user->books,
            'conversations' => $conversations,
        ]);
    }

    public function storeConversation(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string|max:500',
            'parent_id' => 'nullable|exists:conversations,id'
        ]);

        Message::create([
            'user_id'   => $id,
            'sender_id' => auth()->id(),
            'message'   => $request->message,
            'parent_id' => $request->parent_id,
        ]);

        return back();
    }

   public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        // VALIDASI GANDA DIHAPUS - Sudah otomatis divalidasi oleh ProfileUpdateRequest
        
        $user->fill($request->validated());
        
        // Manual assignment untuk field yang mungkin tidak masuk fillable
        $user->instagram = $request->instagram;
        $user->tiktok = $request->tiktok;
        $user->linkedin = $request->linkedin;
        $user->twitter = $request->twitter;
        $user->website = $request->website;
        $user->profile_bg_color = $request->profile_bg_color;

        // Handle Avatar logic
        if ($request->remove_avatar || $request->hasFile('avatar_file')) {
            if ($user->avatar) {
                Storage::disk('public')->delete(str_replace(['/storage/', 'storage/'], '', $user->avatar));
                $user->avatar = null;
            }
        }
        if ($request->hasFile('avatar_file')) {
            $user->avatar = Storage::url($request->file('avatar_file')->store('avatars', 'public'));
        }

        // Handle Background logic
        if ($request->remove_profile_bg || $request->hasFile('profile_bg_image_file')) {
            if ($user->profile_bg_image) {
                Storage::disk('public')->delete(str_replace(['/storage/', 'storage/'], '', $user->profile_bg_image));
                $user->profile_bg_image = null;
            }
        }
        if ($request->hasFile('profile_bg_image_file')) {
            $user->profile_bg_image = Storage::url($request->file('profile_bg_image_file')->store('profile_bg', 'public'));
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();
        return back()->with('status', 'profile-updated');
    }

    public function follow($id)
    {
        $currentUser = Auth::user();
        if ($currentUser->id === (int)$id) {
            return back()->with('error', 'Kamu tidak bisa mengikuti diri sendiri.');
        }
        $currentUser->following()->syncWithoutDetaching([$id]);
        return back()->with('status', 'followed');
    }

    public function unfollow($id)
    {
        Auth::user()->following()->detach($id);
        return back()->with('status', 'unfollowed');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();
        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return Redirect::to('/');
    }

    public function notifications()
    {
        // Mengambil notifikasi dengan paginasi agar tidak berat
        $notifications = auth()->user()->notifications()->paginate(15);

        return Inertia::render('Profile/Notifications', [
            'notifications' => $notifications
        ]);
    }   

    public function showNotification($id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);

        // Tandai dibaca saat dibuka (seperti buka email di Gmail)
        $notification->markAsRead();

        return Inertia::render('Profile/NotificationDetail', [
            'notification' => $notification
        ]);
    }
}