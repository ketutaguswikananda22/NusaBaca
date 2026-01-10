<div style="font-family: sans-serif; padding: 20px; color: #333;">
    <h2>Halo {{ $user->name }},</h2>
    <p>Terima kasih telah mendaftar sebagai penulis di <strong>NusaBaca</strong>.</p>
    
    <div style="padding: 15px; background: #f4f4f4; border-radius: 8px; margin: 20px 0;">
        Hasil Pengajuan: <strong>{{ strtoupper($status) }}</strong>
    </div>

    @if($status === 'approved')
        <p>Selamat! Anda sekarang sudah memiliki akses untuk mengunggah buku karya Anda sendiri. Silakan cek menu Dashboard Anda.</p>
    @else
        <p>Mohon maaf, pengajuan Anda belum dapat kami setujui saat ini. Tetap semangat berkarya!</p>
    @endif

    <p>Salam hangat,<br>Tim NusaBaca</p>
</div>