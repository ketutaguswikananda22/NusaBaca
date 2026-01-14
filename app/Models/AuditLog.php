<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class AuditLog extends Model
{
    protected $fillable = ['action_name', 'details', 'type'];

    // Appending human-readable time (e.g., 2 mins ago)
    protected $appends = ['time_ago'];

    protected function timeAgo(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->created_at->diffForHumans(['short' => true]),
        );
    }
}
