<x-mail::message>
# Pengajuan Buku Belum Disetujui

Halo **{{ $book->user->name }}**,

Terima kasih telah mengirimkan karya Anda yang berjudul **"{{ $book->title }}"** ke platform **NusaBaca**.

Setelah melalui proses kurasi oleh tim moderator kami, dengan berat hati kami menginformasikan bahwa saat ini pengajuan buku Anda **belum dapat kami terbitkan**.

<x-mail::panel>
**Alasan Penolakan:**
{{ $reason }}
</x-panel>

**Apa yang harus saya lakukan?**
Jangan berkecil hati! Anda dapat memperbaiki karya Anda berdasarkan alasan di atas (misalnya memperbaiki cover atau merevisi konten) dan mengajukannya kembali melalui dashboard penulis.

<x-mail::button :url="config('app.url') . '/dashboard'">
Ke Dashboard Penulis
</x-mail::button>

Terima kasih telah menjadi bagian dari komunitas literasi kami.

Salam hangat,<br>
**Tim Moderator {{ config('app.name') }}**
</x-mail::message>