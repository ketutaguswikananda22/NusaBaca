<?php

namespace App\Services;

use Illuminate\Notifications\DatabaseNotification;
use App\Models\User;

class NotificationService
{
    /**
     * Menandai notifikasi sebagai terbaca dan menentukan arah redirect.
     */
    public function markAsReadAndGetRedirect(User $user, string $id): string
    {
        $notification = $user->notifications()->findOrFail($id);
        $notification->markAsRead();

        $data = $notification->data;
        $title = strtolower($data['title'] ?? '');
        $url = $data['url'] ?? '/dashboard';

        // Logika khusus Role yang dipindahkan dari Route
        if ($user->role === 'penulis') {
            if (str_contains($title, 'buku') || str_contains($title, 'karya')) {
                return route('author.book_history');
            }
            if (str_contains($title, 'peringatan') || str_contains($url, 'profile')) {
                return route('reports.history');
            }
        }

        return $url;
    }
}