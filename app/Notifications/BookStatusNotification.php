<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookStatusNotification extends Notification
{
    use Queueable;
    protected $book;
    protected $status;
    protected $data;

    public function __construct($book, $status, $data) {
        $this->book = $book;
        $this->status = $status;
        $this->data = $data;
    }

    public function via($notifiable) {
        return ['database'];
    }

    // File: app/Notifications/BookStatusNotification.php

public function toArray($notifiable)
{
    return [
        'book_id' => $this->data['book_id'] ?? null,
        'title'   => $this->data['title'] ?? 'Update Buku',
        'message' => $this->data['message'] ?? '',
        'status'  => $this->data['status'] ?? 'info',
        // GUNAKAN NAMA RUTE DARI HASIL AUDIT TADI
        'url'     => route('author.book_history'), 
    ];
}

public function toBroadcast($notifiable)
{
    return new \Illuminate\Notifications\Messages\BroadcastMessage([
        'title'   => $this->data['title'],
        'message' => $this->data['message'],
        'url'     => route('author.book_history'),
    ]);
}
}