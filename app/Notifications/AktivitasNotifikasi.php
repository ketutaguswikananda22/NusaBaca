<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Route;

class AktivitasNotifikasi extends Notification
{
    use Queueable;

    protected $details;
    /**
     * Create a new notification instance.
     */
    public function __construct($details)
    {
        $this->details = $details;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via($notifiable)
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
   public function toArray($notifiable)
{
    return [
        'title' => $this->details['title'],
        'message' => $this->details['message'],
        // Gunakan logika pengecekan agar tidak crash
        'url' => $this->details['url'] ?? (Route::has('reports.history') ? route('reports.history') : route('dashboard')),
        'type' => $this->details['type'] ?? 'info',
    ];
}
}
