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
        'user_id',    // Penerima
        'sender_id',  // Pengirim
        'message',
    ];

    // Relasi ke pengirim pesan
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}