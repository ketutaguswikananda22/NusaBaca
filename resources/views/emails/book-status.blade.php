<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; border-radius: 16px; overflow: hidden; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #4f46e5; padding: 30px; text-align: center; color: #ffffff; }
        .content { padding: 32px; }
        .card { background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
        
        /* Status Colors */
        .bg-pending { background-color: #fef3c7; color: #92400e; }
        .bg-published { background-color: #dcfce7; color: #166534; }
        .bg-rejected { background-color: #fee2e2; color: #991b1b; }
        .bg-admin { background-color: #e0e7ff; color: #3730a3; }

        .btn { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #64748b; }
        .text-muted { color: #64748b; font-size: 14px; margin-bottom: 4px; }
        hr { border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    </style>
</head>
<body>
    <div class="wrapper">
        <table class="main">
            <tr>
                <td class="header">
                    <h1 style="margin: 0; font-size: 24px;">NusaBaca</h1>
                </td>
            </tr>
            <tr>
                <td class="content">
                    @if($status === 'admin_notification')
                        <h2 style="margin-top: 0;">Halo Admin! 🔔</h2>
                        <p>Ada karya baru yang masuk dan memerlukan perhatian Anda segera untuk proses moderasi.</p>
                    @else
                        <h2 style="margin-top: 0;">Halo, {{ $book->user->name }}! 👋</h2>
                        <p>Kami memiliki pembaruan mengenai status karya yang Anda kirimkan ke NusaBaca.</p>
                    @endif

                    <div class="card">
                        <div class="text-muted">Judul Karya:</div>
                        <div style="font-size: 18px; font-weight: bold; margin-bottom: 16px;">{{ $book->title }}</div>

                        <div class="text-muted">Status Saat Ini:</div>
                        <div style="margin-top: 4px;">
                            @if($status === 'pending')
                                <span class="status-badge bg-pending">Menunggu Moderasi</span>
                            @elseif($status === 'published')
                                <span class="status-badge bg-published">Telah Terbit</span>
                            @elseif($status === 'admin_notification')
                                <span class="status-badge bg-admin">Moderasi Baru</span>
                            @else
                                <span class="status-badge bg-rejected">Ditolak</span>
                            @endif
                        </div>
                    </div>

                    <div style="line-height: 1.6;">
                        @if($status === 'admin_notification')
                            <p>Penulis <strong>{{ $book->user->name }}</strong> baru saja mengirimkan karyanya. Silakan login ke dashboard untuk memeriksa konten tersebut.</p>
                            <div style="text-align: center;">
                                <a href="{{ url('/admin/books') }}" class="btn">Masuk Ke Dashboard</a>
                            </div>
                        @elseif($status === 'pending')
                            <p>Terima kasih telah berkarya! Buku Anda sudah kami terima dan saat ini sedang dalam antrean <strong>moderasi</strong>. Kami akan segera memberi tahu Anda melalui email jika buku sudah siap diterbitkan.</p>
                        @elseif($status === 'published')
                            <p><strong>Selamat!</strong> Buku Anda sekarang sudah muncul di Katalog NusaBaca dan dapat dinikmati oleh pembaca di seluruh dunia. Teruslah menginspirasi dengan tulisan-tulisan hebat lainnya!</p>
                            <div style="text-align: center;">
                                <a href="{{ url('/katalog') }}" class="btn">Lihat di Katalog</a>
                            </div>
                        @else
                            <p>Mohon maaf, setelah melalui peninjauan, buku Anda belum bisa kami publikasikan saat ini. Silakan periksa kembali konten Anda agar sesuai dengan ketentuan komunitas kami dan jangan ragu untuk mengirimkannya kembali setelah diperbaiki.</p>
                        @endif
                    </div>

                    <hr>
                    <p style="margin-bottom: 0;">Salam hangat,</p>
                    <p style="margin-top: 4px; font-weight: bold;">Tim NusaBaca</p>
                </td>
            </tr>
        </table>
        <div class="footer">
            <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.<br>
            &copy; 2026 NusaBaca. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>