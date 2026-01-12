<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia; 
use App\Mail\ReportNotification;
use Illuminate\Support\Facades\Mail;
use App\Notifications\AktivitasNotifikasi;

class ReportController extends Controller
{
    // --- FUNGSI UNTUK ADMIN ---
    public function index()
    {
        // Mengambil semua laporan dengan data user pelapor & yang dilaporkan
        $reports = Report::with(['user', 'reportedUser'])->latest()->get();

        return Inertia::render('Admin/Reports/Index', [
            'reports' => $reports
        ]);
    }

    public function destroy($id)
    {
        // Menghapus laporan jika admin sudah selesai memproses
        $report = Report::findOrFail($id);
        $report->delete();

        return redirect()->back()->with('success', 'Laporan berhasil dihapus.');
    }


    // --- FUNGSI UNTUK USER (Punya kamu yang tadi) ---
   
    public function store(Request $request)
{
    $request->validate([
        'book_id' => 'nullable|exists:books,id', 
        'reported_author_id' => 'required|exists:users,id',
        'reason' => 'required|string|max:255',
        'description' => 'nullable|string',
    ]);

    // 1. Cek apakah user sudah pernah melaporkan PENULIS ini sebelumnya
    $authorReported = Report::where('user_id', Auth::id())
        ->where('reported_user_id', $request->reported_author_id)
        ->exists();

    if ($authorReported) {
        return redirect()->back()->with('error', 'Anda sudah melaporkan akun penulis ini sebelumnya.');
    }

    // 2. Cek apakah user sudah pernah melaporkan BUKU ini sebelumnya (jika ada book_id)
    if ($request->book_id) {
        $bookReported = Report::where('user_id', Auth::id())
            ->where('book_id', $request->book_id)
            ->exists();

        if ($bookReported) {
            return redirect()->back()->with('error', 'Anda sudah melaporkan buku ini sebelumnya.');
        }
    }

    // Jika lolos dua pengecekan di atas, baru buat laporannya
    Report::create([
        'user_id' => Auth::id(),
        'book_id' => $request->book_id,
        'reported_user_id' => $request->reported_author_id,
        'reason' => $request->reason,
        'description' => $request->description,
        'status' => 'pending', // Pastikan ada default status
    ]);

    @Mail::to('nusabacaa@gmail.com')->send(new ReportNotification("Laporan Masuk Baru", "Ada laporan baru masuk ke sistem."));

    return redirect()->back()->with('success', 'Laporan berhasil dikirim.');
}

    public function update(Request $request, $id)
    {   
        try {
            $report = Report::findOrFail($id);
            $report->status = $request->status;
            $report->save(); 

        if ($request->status === 'resolved') {
            $penulis = \App\Models\User::find($report->reported_user_id);
            $pelapor = \App\Models\User::find($report->user_id);

            if ($pelapor) {
                // Notifikasi Email
                @Mail::to($pelapor->email)->send(new ReportNotification("Laporan Selesai", "Laporan Anda ditindaklanjuti."));
                
                // --- NOTIFIKASI LONCENG PELAPOR ---
                $pelapor->notify(new AktivitasNotifikasi([
                    'title'   => 'Laporan Selesai',
                    'message' => 'Laporan Anda telah ditindaklanjuti oleh admin.',
                    'url'     => '/history-laporan', // Sesuaikan URL-mu
                    'type'    => 'success'
                ]));
            }

            if ($penulis) {
                // 1. Definisikan daftar pesan sistem otomatis
                $systemMessages = [
                    'PLAGIARISM' => 'SISTEM KAMI MENDETEKSI ADANYA INDIKASI PLAGIARISME TANPA IZIN PADA KARYA ANDA.',
                    'Spam' => 'AKUN ANDA DILAPORKAN KARENA MELAKUKAN AKTIVITAS PENGIRIMAN PESAN ATAU KONTEN MASSAL.',
                    'INAPPROIRATE CONTENT' => 'KONTEN YANG ANDA UNGGAH DINILAI MELANGGAR PEDOMAN KOMUNITAS.',
                    'HARASSMENT' => 'SISTEM MENERIMA LAPORAN TERKAIT TINDAKAN PELECEHAN ATAU PERUNDUNGAN.',
                    'IMPERSONATION' => 'AKUN ANDA DILAPORKAN KARENA MENGGUNAKAN IDENTITAS ORANG LAIN TANPA IZIN.',
                ];
                
                $dbReason = strtoupper(trim($report->reason));
                // 2. Ambil pesan berdasarkan alasan laporan, jika tidak terdaftar gunakan default
                $pesanOtomatis = $systemMessages[$dbReason] ?? 'Akun Anda dilaporkan karena melanggar pedoman komunitas.';

                foreach ($systemMessages as $key => $message) {
                    if (str_contains($dbReason, $key)) {
                        $pesanOtomatis = $message;
                        break;
                    }
                }

                // Notifikasi Email (menggunakan pesan otomatis agar seragam)
                @Mail::to($penulis->email)->send(new ReportNotification("Peringatan Akun", $pesanOtomatis, $report->reason));

                // --- NOTIFIKASI LONCENG PENULIS ---
                $penulis->notify(new AktivitasNotifikasi([
                    'title'   => 'Peringatan Akun',
                    'message' => $pesanOtomatis, // Sekarang pesan ini lebih deskriptif
                    'url'     => '/history-laporan',
                    'type'    => 'warning'
                ]));

                $jumlahPelanggaran = Report::where('reported_user_id', $penulis->id)
                                    ->where('status', 'resolved')
                                    ->count();

                if ($jumlahPelanggaran >= 3) {
                    $penulis->update([
                        'is_banned' => true,
                        'status'    => 'suspended'
                    ]);
                    @Mail::to($penulis->email)->send(new ReportNotification("Akun Ditangguhkan", "Akun diblokir karena >3 laporan valid."));
                    
                    // --- NOTIFIKASI LONCENG BANNED ---
                    $penulis->notify(new AktivitasNotifikasi([
                        'title'   => 'Akun Ditangguhkan',
                        'message' => 'Akun Anda telah dinonaktifkan secara permanen.',
                        'url'     => '/contact-support',
                        'type'    => 'error'
                    ]));
                }
            }
        }

        return redirect()->back()->with('success', 'Status berhasil diperbarui!');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }


    public function history()
    {
        $user = Auth::user();

    // Mapping pesan otomatis berdasarkan alasan (reason)
    $systemMessages = [
        'PLAGIARISM' => 'SISTEM  KAMI MENDETEKSI ADANYA INDIKASI PLAGIARISME TANPA IZIN PADA KARYA ANDA.',
        'SPAM' => 'AKUN ANDA DILAPORKAN KARENA MELAKUKAN AKTIVITAS PENGIRIMAN PESAN ATAU KONTEN MASSAL.',
        'INAPPROIRATE CONTENT' => 'KONTEN YANG ANDA UNGGAH DINILAI MELANGGAR PEDOMAN KOMUNITAS.',
        'HARASSMENT' => 'SISTEM MENERIMA LAPORAN TERKAIT TINDAKAN PELECEHAN ATAU PERUNDUNGAN.',
        'IMPERSONATION' => 'AKUN ANDA DILAPORKAN KARENA MENGGUNAKAN IDENTITAS ORANG LAIN TANPA IZIN.',
    ];

    $data = \App\Models\Report::where('user_id', $user->id)
        ->orWhere('reported_user_id', $user->id)
        ->latest()
        ->get()
        ->map(function ($report) use ($user, $systemMessages) {

            $dbReason = strtoupper(trim($report->reason));  
            // Ambil pesan sistem berdasarkan alasan, jika tidak ada gunakan default deskripsi pelapor
            $fullReason = $systemMessages[$dbReason] ?? ($report->description ?? 'Laporan pelanggaran aturan komunitas.');

            foreach ($systemMessages as $key => $message) {
                    if (str_contains($dbReason, $key)) {
                    $fullReason = $message;
                    break;
                }
            }

            // Jika yang melihat adalah Author (terlapor)
            if ($report->reported_user_id === $user->id) {
                return [
                    'id' => $report->id,
                    'reason' => $fullReason, // Gunakan pesan otomatis di sini
                    'status' => $report->status,
                    'created_at' => $report->created_at,
                    'reported_user' => [
                        'name' => 'Peringatan Akun',
                        'role' => 'system'
                    ],
                    'book' => $report->book
                ];
            }
            
            // Jika yang melihat adalah Pelapor asli
            return [
                'id' => $report->id,
                'reason' => $report->reason,
                'status' => $report->status,
                'created_at' => $report->created_at,
                'reported_user' => $report->reportedUser,
                'book' => $report->book
            ];
        });

    return Inertia::render('Reports/History', [
        'reports' => ['data' => $data] 
        ]);
    }
}