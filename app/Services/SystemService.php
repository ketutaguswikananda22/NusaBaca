<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

class SystemService
{
    public function getSystemHealth(): array
    {
        $maxQuota = config('app.max_storage_quota', 500 * 1024 * 1024);
        $storagePath = storage_path('app/public');
        $sizeInBytes = 0;

        if (File::exists($storagePath)) {
            foreach (File::allFiles($storagePath) as $file) {
                $sizeInBytes += $file->getSize();
            }
        }

        $percentage = min(round(($sizeInBytes / $maxQuota) * 100, 2), 100);
        $statusText = $percentage >= 90 ? 'FULL' : ($percentage >= 70 ? 'WARNING' : 'AVAILABLE');

        return [
            'api' => 'OPTIMAL',
            'db' => DB::connection()->getPdo() ? 'HEALTHY' : 'DOWN',
            'storage' => $statusText,
            'storage_percentage' => $percentage,
        ];
    }
}