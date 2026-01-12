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
                // Notifikasi Email
                @Mail::to($penulis->email)->send(new ReportNotification("Peringatan Akun", "Akun Anda dilaporkan.", $report->reason));
                
                // --- NOTIFIKASI LONCENG PENULIS ---
                $penulis->notify(new AktivitasNotifikasi([
                    'title'   => 'Peringatan Akun',
                    'message' => 'Akun Anda dilaporkan dengan alasan: ' . $report->reason,
                    'url'     => '/settings/profile',
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
        $reports = \App\Models\Report::with(['book', 'reportedUser']) // Tambahkan reportedUser
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Reports/History', [
            'reports' => $reports
        ]);
    }
}