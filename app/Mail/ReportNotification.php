<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReportNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public $pesan;
    public $reason;

    // Tambahkan parameter agar bisa menerima data dari Controller
    public function __construct($subject, $pesan = "", $reason = null)
    {
        $this->subject = $subject;
        $this->pesan = $pesan;
        $this->reason = $reason;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            // SESUAIKAN DENGAN NAMA FILE: report-status (pakai strip)
            view: 'emails.report-status', 
        );
    }
    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
