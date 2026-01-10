<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // Tambahkan ini
use Illuminate\Database\Eloquent\Model;

class BookPart extends Model
{
    use HasFactory; // Sekarang garis merah akan hilang

    protected $fillable = ['book_id', 'title', 'content', 'order'];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}