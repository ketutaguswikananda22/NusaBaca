<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Book;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'book_id', 
        'reported_user_id', // Tambahkan ini
        'reason', 
        'description'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }

    public function reporter() // Orang yang melapor
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reportedUser() // Orang yang dilaporkan
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }
}
