<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookStatusNotification extends Notification
{
    use Queueable;
    protected $book;
    protected $status;

    public function __construct($book, $status) {
        $this->book = $book;
        $this->status = $status;
    }

    public function via($notifiable) {
        return ['database'];
    }

    public function toArray($notifiable) {
        return [
            'book_id' => $this->book->id,
            'title'   => 'Update Status Karya',
            'message' => "Buku '{$this->book->title}' statusnya menjadi: {$this->status}",
            
        ];
    }
}