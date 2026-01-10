<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia; // Tambahkan ini di atas
use App\Mail\ReportNotification;
use Illuminate\Support\Facades\Mail;

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
            'reported_author_id' => 'nullable|exists:users,id',
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Report::create([
            'user_id' => Auth::id(),
            'book_id' => $request->book_id,
            'reported_user_id' => $request->reported_author_id,
            'reason' => $request->reason,
            'description' => $request->description,
        ]);

        Mail::to('nusabacaa@gmail.com')->send(new ReportNotification("Laporan Masuk Baru", "Ada laporan baru masuk ke sistem. Segera cek dashboard admin."));

        return redirect()->back()->with('success', 'Laporan berhasil dikirim.');
    }

    public function update(Request $request, $id)
{
    $report = Report::with(['user', 'reportedUser'])->findOrFail($id);
    
    // 1. Update Status Laporan
    $report->update(['status' => $request->status]);

   if ($request->status === 'resolved') {
    $penulis = $report->reportedUser;
    $pelapor = $report->user;

    // 2. Kirim Email ke Pelapor
    Mail::to($pelapor->email)->send(new ReportNotification(
        "Laporan Anda Selesai Ditinjau", 
        "Halo {$pelapor->name}, laporan Anda terhadap {$penulis->name} telah kami tindak lanjuti."
    ));

    // 3. Kirim Email ke Penulis (Sertakan $report->reason sebagai parameter ke-3)
    Mail::to($penulis->email)->send(new ReportNotification(
        "Peringatan Akun", 
        "Halo {$penulis->name}, akun Anda dilaporkan. Mohon patuhi pedoman komunitas.",
        $report->reason 
    ));

        // 4. LOGIKA AUTO-BANNED (Jika sudah > 3 kali dilaporkan & resolved)
        $jumlahPelanggaran = Report::where('reported_user_id', $penulis->id)
                                    ->where('status', 'resolved')
                                    ->count();

        if ($jumlahPelanggaran >= 3) {
            $penulis->update(['is_banned' => true]); // Pastikan ada kolom is_banned di tabel users
            
            // Email pemberitahuan Banned
            Mail::to($penulis->email)->send(new ReportNotification("Akun Anda Ditangguhkan", "Akun Anda telah diblokir permanen karena telah menerima lebih dari 3 laporan valid."));
        }
    }

    return redirect()->back()->with('success', 'Tinjauan selesai dan email notifikasi telah dikirim.');
    }
}