<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// app/Events/SystemStatusUpdated.php

class SystemStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $stats;

    public function __construct($stats)
    {
        // Menyimpan data status sistem (API, DB, Storage)
        $this->stats = $stats;
    }

    public function broadcastOn(): array
    {
        // Mengirim ke channel publik agar dashboard admin bisa mendengar
        return [
            new Channel('system-status'),
        ];
    }
    public function broadcastWith(): array
{
    return [
        'api_gateway' => $this->stats['api'] ?? 'OPTIMAL',
        'operational' => 'HEALTHY',
        'database' => $this->stats['db'] ?? 'HEALTHY',
        's3_storage' => $this->stats['storage'] ?? 'AVAILABLE',
        'storage_percentage' => $this->stats['storage_percentage'] ?? 0, // Tambahkan ini
    ];
}

    private function getStorageStatus(): string
    {
        return 'AVAILABLE';
    }
}