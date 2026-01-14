<?php

namespace App\Events;

use App\Models\AuditLog;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuditUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // Data log yang akan dikirim ke React
    public function __construct(public AuditLog $log)
    {
    }

    /**
     * Nama channel tempat kita menyiarkan log
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('admin-logs'),
        ];
    }

    /**
     * Nama event yang akan didengarkan oleh Echo (Opsional)
     */
    public function broadcastAs(): string
    {
        return 'AuditUpdated';
    }
}