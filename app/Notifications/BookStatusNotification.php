<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class BookStatusNotification extends Notification
{
    use Queueable;

    protected $book;
    protected $status;
    protected $message;

    // DIMANA: Constructor disederhanakan
    // MENGAPA: Agar pemanggilan di Controller lebih mudah dan tidak rawan error jumlah argumen
    public function __construct($book, $status, $message = null) 
    {
        $this->book = $book;
        $this->status = $status;
        $this->message = $message;
    }

    public function via($notifiable) 
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        // MENGAPA: Kita susun array secara manual dari property yang sudah ada
        return [
            'book_id' => $this->book->id,
            'title'   => $this->status === 'approved' ? 'Buku Disetujui!' : 'Buku Ditolak',
            'message' => $this->message ?? "Status buku '{$this->book->title}' telah diperbarui.",
            'category' => 'buku',
            'status'  => $this->status, // 'approved' atau 'rejected'
            'url'     => route('author.book_history'), 
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title'   => $this->status === 'approved' ? 'Buku Disetujui!' : 'Buku Ditolak',
            'message' => $this->message,
            'url'     => route('author.book_history'),
        ]);
    }
}