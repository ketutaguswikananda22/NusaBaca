<?php

namespace App\Observers;

use App\Models\Genre;

class GenreObserver
{
    /**
     * Handle the Genre "created" event.
     */
    public function created(Genre $genre): void
{
    \App\Models\AuditLog::create([
        'action_name' => 'GENRE ADDED',
        'details' => "New genre: {$genre->name}",
        'type' => 'info',
    ]);
}

    /**
     * Handle the Genre "updated" event.
     */
    public function updated(Genre $genre): void
    {
        //
    }

    /**
     * Handle the Genre "deleted" event.
     */
    public function deleted(Genre $genre): void
    {
        //
    }

    /**
     * Handle the Genre "restored" event.
     */
    public function restored(Genre $genre): void
    {
        //
    }

    /**
     * Handle the Genre "force deleted" event.
     */
    public function forceDeleted(Genre $genre): void
    {
        //
    }
}
