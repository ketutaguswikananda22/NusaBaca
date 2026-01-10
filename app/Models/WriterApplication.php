<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WriterApplication extends Model
{
    protected $fillable = ['user_id', 'pen_name', 'bio', 'message', 'status', 'message'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
