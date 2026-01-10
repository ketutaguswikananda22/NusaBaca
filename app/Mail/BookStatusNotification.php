<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookStatusNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $book;
    public $status;

    public function __construct($book, $status)
    {
        $this->book = $book;
        $this->status = $status; 
    }

    public function envelope(): Envelope
{
    $subject = match ($this->status) {
        'pending'            => 'Karya Berhasil Dikirim - NusaBaca',
        'published'          => 'Selamat! Karya Anda Telah Terbit',
        'rejected'           => 'Pemberitahuan Mengenai Karya Anda',
        'admin_notification' => '🔔 Ada Karya Baru Menunggu Moderasi!', // Subjek untuk Admin
        default              => 'Update Status Karya',
    };

    return new Envelope(
        subject: $subject,
    );
}

    public function content(): Content
    {
        return new Content(
            view: 'emails.book-status',
            with: [
                'title' => $this->book->title,
                'status' => $this->status,
                'author' => $this->book->user->name ?? 'Penulis',
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}