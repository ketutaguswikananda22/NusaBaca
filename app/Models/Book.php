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
   public function getCoverPathAttribute($value)
{
    // 1. Jika null/kosong
    if (!$value) return asset('image/default-cover.jpg');

    // 2. Audit: Deteksi URL berlapis
    // Jika value mengandung http, kita ambil bagian belakangnya saja
    if (str_contains($value, 'http')) {
        // Jika value sudah berisi URL lengkap, cek apakah dia mengandung 'storage/'
        // Kita pecah dan ambil bagian setelah 'covers/' atau ambil nama filenya saja
        $segments = explode('/', $value);
        $fileName = end($segments);
        $value = $fileName;
    }

    // 3. Normalisasi path
    $path = preg_replace('/^(storage|public)\//', '', ltrim($value, '/'));

    if (!str_starts_with($path, 'books/')) {
        $path = 'books/covers/' . $path;
    }

    // 4. Cek fisik file di Laragon
    if (!file_exists(storage_path('app/public/' . $path))) {
        return asset('image/default-cover.jpg');
    }

    // 5. Return URL bersih
    return asset('storage/' . $path);
}
}