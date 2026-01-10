<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Book;
use App\Models\User;
use App\Models\Message;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $user = $request->user();
        
        $userData = User::with([
            'books' => fn($q) => $q->where('status', 'published')->withCount('parts')->withAvg('ratings', 'rating')->latest(),
            'following', 
            'followers', 
            'readingLists.books'
        ])->withCount(['books', 'followers', 'following', 'readingLists'])->findOrFail($user->id);

        $conversations = Message::where('user_id', $user->id)
            ->with('sender')
            ->latest()
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'message' => $msg->message,
                    'date' => $msg->created_at->diffForHumans(),
                    'user' => [
                        'name' => $msg->sender->name ?? 'User',
                        'avatar' => $msg->sender->avatar ?? '/default-avatar.png',
                    ]
                ];
            });

        // Mapping path gambar agar muncul di React
        $userData->books->transform(function ($book) {
            $book->cover_path = $book->cover_path 
                ? (str_starts_with($book->cover_path, 'http') ? $book->cover_path : asset('storage/' . $book->cover_path)) 
                : null;
            return $book;
        });

        // PERBAIKAN: Menambahkan status 'is_followed' pada daftar authors
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
                // Cek apakah user yang sedang login mengikuti author ini
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
            'stats' => [
                'totalUsers' => (int) User::where('role', '!=', 'admin')->count(), 
                'totalBooks' => (int) Book::count(),
                'pendingAuthors' => (int) User::where('role', 'user')->count(), 
            ],
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'profile_bg_color' => 'nullable|string|max:7',
            'profile_bg_image_file' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
            'avatar_file' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'remove_avatar' => 'nullable', 
            'remove_profile_bg' => 'nullable'
        ]);

        $user->fill($request->validated());
        $user->instagram = $request->instagram;
        $user->tiktok = $request->tiktok;
        $user->linkedin = $request->linkedin;
        $user->twitter = $request->twitter;
        $user->website = $request->website;
        $user->profile_bg_color = $request->profile_bg_color;

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
        
        // Return back akan memicu Inertia reload dengan data terbaru
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

    public function storeConversation(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string|max:500',
            'parent_id' => 'nullable|exist:conversations,id'
        ]);

        Message::create([
            'user_id'   => $id,
            'receiver_id' => $id,
            'sender_id' => auth()->id(),
            'message'   => $request->message,
            'parent_id' => $request->parent_id,
        ]);

        return back()->with('status', 'Pesan berhasil dikirim!');
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                $oldPath = str_replace(['/storage/', 'storage/'], '', $user->avatar);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->update([
                'avatar' => Storage::url($path),
            ]);
        }

        return redirect()->back()->with('status', 'profile-picture-updated');
    }

    public function showPublicProfile($id)
    {
        $user = User::with(['books' => fn($q) => $q->where('status', 'published')->withCount('parts')])
                    ->withCount(['followers', 'following'])
                    ->findOrFail($id);

        if ($user->website) {
            $user->website_display = preg_replace('/(^https?:\/\/)/', '', $user->website);
        }
        
        // PERBAIKAN: Status follow untuk profil publik
        $user->is_followed = Auth::check() ? Auth::user()->following()->where('following_id', $id)->exists() : false;

        $conversations = Message::where('user_id', $id)
            ->with('sender')
            ->latest()
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'message' => $item->message,
                    'date' => $item->created_at->diffForHumans(),
                    'user' => [
                        'name' => $item->sender->name,
                        'avatar' => $item->sender->avatar ?? '/default-avatar.png',
                    ]
                ];
            });

        return Inertia::render('Profile/public/Show', [
            'author' => $user,
            'books' => $user->books,
            'conversations' => $conversations,
        ]);
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

    public function destroyAvatar(Request $request)
    {
        $user = $request->user();
        if ($user->avatar) {
            $path = str_replace('/storage/', '', $user->avatar);
            Storage::disk('public')->delete($path);
        }
        $user->update(['avatar' => null]);
        return redirect()->back();
    } 
}