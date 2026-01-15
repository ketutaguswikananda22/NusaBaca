<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Book;
use App\Models\ReadingList;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\User[] $following
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\User[] $followers
 */

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */

    protected $fillable = [
        'name', 'email','password','avatar', 'bio',
        'instagram','website','location','gender',
        'twitter','points','rating','role','status',
        'profile_bg_color','profile_bg_image', 'instagram',
        'tiktok', 'linkedin', 'twitter', 'is_banned'
    ];

    protected $appends = [
        'profile_photo_url',
    ];

    public function books()
    {
        return $this->hasMany(Book::class);
    }

    public function readingLists()
    {
        return $this->hasMany(ReadingList::class);
    }

    // App/Models/User.php

    // User yang mengikuti saya (Para Pengikut)
    // User yang diikuti oleh user ini (Following)
    public function following()
    {
        // Tambahkan 'followers' sebagai parameter kedua (nama tabel)
        return $this->belongsToMany(User::class, 'followers', 'follower_id', 'following_id');
    }

    public function followers()
    {
        // Tambahkan 'followers' sebagai parameter kedua (nama tabel)
        return $this->belongsToMany(User::class, 'followers', 'following_id', 'follower_id');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_seen' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function writerApplication()
    {
        return $this->hasOne(WriterApplication::class);
    }

    public function profileConversations()
    {
        return $this->hasMany(Conversation::class, 'profile_owner_id')
            ->whereNull('parent_id') // Hanya ambil pesan utama, bukan reply
            ->with(['user', 'replies.user']) // Ambil data pengirim & balasannya
            ->orderBy('is_pinned', 'desc') // Pesan yang di-pin selalu di atas
            ->orderBy('created_at', 'desc');
    }

    // Pesan yang sedang di-pin untuk ditampilkan di tab Perihal
    public function pinnedMessage()
    {
        return $this->hasOne(Conversation::class, 'profile_owner_id')
            ->where('is_pinned', true)
            ->with('user');
    }

    public function profileMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id')->with('sender')->latest();
    }

    public function getProfilePhotoUrlAttribute()
    {
        if ($this->avatar) {
            // Jika avatar diawali http (seperti dari Google/sosmed), pakai langsung
            // Jika tidak, ambil dari folder storage
            return str_starts_with($this->avatar, 'http') 
                ? $this->avatar 
                : asset('storage/' . $this->avatar);
        }

        // Jika tidak ada foto, kirim null agar frontend pakai inisial
        return null;
    }
}
