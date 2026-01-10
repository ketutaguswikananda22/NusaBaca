<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px; }
        .header { background-color: #f97316; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background-color: #ffffff; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; }
        .button { display: inline-block; padding: 12px 25px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .badge { display: inline-block; padding: 5px 10px; background-color: #fee2e2; color: #ef4444; border-radius: 4px; font-weight: bold; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0; font-style: italic; font-weight: 900;">Nusa<span style="color: #262626;">Baca</span></h1>
        </div>
        <div class="content">
            <h2 style="color: #262626;">{{ $subject }}</h2>
            <p>{{ $pesan }}</p>
            
            @if(isset($reason))
                <p><strong>Alasan Pelanggaran:</strong> <span class="badge">{{ $reason }}</span></p>
            @endif

            <p>Terima kasih telah menjadi bagian dari komunitas NusaBaca dalam menjaga kenyamanan bersama.</p>
            
            <a href="{{ config('app.url') }}" class="button">Buka Aplikasi</a>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} NusaBaca Team. Sistem Notifikasi Otomatis.
        </div>
    </div>
</body>
</html>