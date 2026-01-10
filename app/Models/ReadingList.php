<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ReadingList extends Model
{
    protected $fillable = ['user_id', 'name'];

    /**
     * Relasi Many-to-Many ke Buku
     */
    public function books(): BelongsToMany
    {
        return $this->belongsToMany(Book::class, 'book_reading_list');
    }
}
