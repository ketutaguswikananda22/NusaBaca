<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'profile_owner_id',
        'message',
        'parent_id',
        'is_pinned'
    ];

    // Data user yang mengirim pesan (Pemberi komentar)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Untuk mengambil balasan dari sebuah pesan (Replies)
    public function replies()
    {
        return $this->hasMany(Conversation::class, 'parent_id')->orderBy('created_at', 'asc');
    }

    // Mempermudah format waktu untuk React (misal: "2 jam yang lalu")
    protected $appends = ['created_at_human'];

    public function getCreatedAtHumanAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}
