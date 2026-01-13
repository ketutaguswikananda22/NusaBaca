<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Book;
use App\Models\User;
use App\Models\Message;
use App\Models\Genre; // Tambahkan ini agar sistem kenal tabel genre
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Menampilkan halaman edit profil (Private)
     */
    public function edit(Request $request)
    {
        $user = $request->user();
        
        $userData = User::with([
            'books' => fn($q) => $q->where('status', 'published')->withCount('parts')->withAvg('ratings', 'rating')->latest(),
            'following', 
            'followers', 
            'readingLists.books'
        ])->withCount(['books', 'followers', 'following', 'readingLists'])->findOrFail($user->id);

        // Ambil pesan utama beserta balasannya untuk user yang sedang login
       // Ambil HANYA pesan utama (parent_id kosong)
$conversations = Message::where('user_id', $user->id)
    ->whereNull('parent_id') // <--- WAJIB ADA AGAR TIDAK TERPISAH
    ->with(['sender', 'replies.sender'])
    ->latest()
    ->get()
    ->map(function ($msg) {
        return [
            'id' => $msg->id,
            'message' => $msg->message,
            'created_at' => $msg->created_at,
            'user' => [
                'name' => $msg->sender->name ?? 'User',
                'avatar' => $msg->sender->avatar,
            ],
            // Pastikan replies ini terisi otomatis dari relasi hasMany di Model
            'replies' => $msg->replies->map(function ($reply) {
                return [
                    'id' => $reply->id,
                    'message' => $reply->message,
                    'created_at' => $reply->created_at,
                    'user' => [
                        'name' => $reply->sender->name ?? 'User',
                        'avatar' => $reply->sender->avatar,
                    ]
                ];
            })
        ];
    });

        // Mapping path gambar cover buku
        $userData->books->transform(function ($book) {
            $book->cover_path = $book->cover_path 
                ? (str_starts_with($book->cover_path, 'http') ? $book->cover_path : asset('storage/' . $book->cover_path)) 
                : null;
            return $book;
        });

        // Daftar author lain untuk disarankan
        $authors = User::where('role', '!=', 'admin')
            ->where('id', '!=', $user->id)
            ->select('id', 'name', 'email', 'role', 'status', 'avatar')
            ->addSelect(['last_activity' => DB::table('sessions')
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
        ]);
    }

    /**
     * Menampilkan profil publik user lain
     */
    public function showPublicProfile($id)
    {
        $user = User::with(['books' => fn($q) => $q->where('status', 'published')->withCount('parts')])
                    ->withCount(['followers', 'following'])
                    ->findOrFail($id);

        if ($user->website) {
            $user->website_display = preg_replace('/(^https?:\/\/)/', '', $user->website);
        }
        
        $user->is_followed = Auth::check() ? Auth::user()->following()->where('following_id', $id)->exists() : false;

        // Ambil pesan utama beserta balasannya untuk profil publik ini
        $conversations = Message::where('user_id', $user->id)
            ->whereNull('parent_id') 
            ->with(['sender', 'replies.sender'])
            ->latest()
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'message' => $msg->message,
                    'created_at' => $msg->created_at,
                    'user' => [
                        'name' => $msg->sender->name ?? 'User',
                        'avatar' => $msg->sender->avatar,
                    ],
                    'replies' => $msg->replies->map(function ($reply) {
                        return [
                            'id' => $reply->id,
                            'message' => $reply->message,
                            'created_at' => $reply->created_at,
                            'user' => [
                                'name' => $reply->sender->name ?? 'User',
                                'avatar' => $reply->sender->avatar,
                            ]
                        ];
                    })
                ];
            });

        return Inertia::render('Profile/public/Show', [
            'author' => $user,
            'books' => $user->books,
            'conversations' => $conversations,
        ]);
    }

    /**
     * Menyimpan pesan baru atau balasan
     */
    public function storeConversation(Request $request, $id)
{
    $request->validate([
        'message' => 'required|string|max:500',
        'parent_id' => 'nullable|exists:conversations,id'
    ]);

    // Berdasarkan struktur tabel di gambar Anda: id, user_id, sender_id, message, parent_id
    Message::create([
        'user_id'   => $id,                // Pemilik profil (Wika Nanda)
        'sender_id' => auth()->id(),       // Orang yang kirim pesan
        'message'   => $request->message,
        'parent_id' => $request->parent_id, // Penting agar jadi balasan
    ]);

    return back();
}

    /**
     * Update data profil
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'profile_bg_color' => 'nullable|string|max:7',
            'profile_bg_image_file' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
            'avatar_file' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user->fill($request->validated());
        $user->instagram = $request->instagram;
        $user->tiktok = $request->tiktok;
        $user->linkedin = $request->linkedin;
        $user->twitter = $request->twitter;
        $user->website = $request->website;
        $user->profile_bg_color = $request->profile_bg_color;

        // Handle Avatar
        if ($request->remove_avatar == true || $request->hasFile('avatar_file')) {
            if ($user->avatar) {
                $oldAvatarPath = str_replace(['/storage/', 'storage/'], '', $user->avatar);
                Storage::disk('public')->delete($oldAvatarPath);
                $user->avatar = null;
            }
        }

        if ($request->hasFile('avatar_file')) {
            $avatarPath = $request->file('avatar_file')->store('avatars', 'public');
            $user->avatar = Storage::url($avatarPath);
        }

        // Handle Background Image
        if ($request->remove_profile_bg == true || $request->hasFile('profile_bg_image_file')) {
            if ($user->profile_bg_image) {
                $oldBgPath = str_replace(['/storage/', 'storage/'], '', $user->profile_bg_image);
                Storage::disk('public')->delete($oldBgPath);
                $user->profile_bg_image = null;
            }
        }

        if ($request->hasFile('profile_bg_image_file')) {
            $bgPath = $request->file('profile_bg_image_file')->store('profile_bg', 'public');
            $user->profile_bg_image = Storage::url($bgPath);
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
        $currentUser = Auth::user();
        $currentUser->following()->detach($id);
        return back()->with('status', 'unfollowed');
    }

    public function toggleUserStatus(User $user)
    {
        $user->status = ($user->status === 'active') ? 'suspended' : 'active';
        $user->save();
        return redirect()->back();
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);
        $user = $request->user();
        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return Redirect::to('/');
    }

    public function notifications()
    {
        return Inertia::render('Notifications/Index', [
            'allNotifications' => auth()->user()->notifications()->paginate(10)
        ]);
    }
}