<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = 
    ['user_id', 'title', 'description', 'genre', 'file_path', 'cover_path', 'status'];

    protected $casts = [
        'genre' => 'array',
    ];

    public function user()
        {
            return $this->belongsTo(User::class);
        }

        public function parts() {
        return $this->hasMany(BookPart::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function averageRating()
    {
        return $this->ratings()->avg('rating') ?: 0;
    }
}