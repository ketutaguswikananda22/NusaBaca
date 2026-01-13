<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Message extends Model
{
    use HasFactory;

    // WAJIB: Kasih tahu Laravel kalau nama tabelnya adalah 'conversations'
    protected $table = 'conversations';

    protected $fillable = [
    'user_id',
    'sender_id',
    'message',
    'parent_id', // WAJIB ADA DI SINI
];

    protected $appends = ['created_at_formatted'];

    public function getCreatedAtFormattedAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    public function replies()
    {
        return $this->hasMany(Message::class, 'parent_id')->with('sender')->latest();
    }

    // Relasi ke pengirim pesan
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}