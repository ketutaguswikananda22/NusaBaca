<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
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
        // Audit: Menambahkan 'book' agar admin bisa melihat buku apa yang dilaporkan
        $reports = Report::with(['user', 'reportedUser', 'book'])->latest()->get();

        return Inertia::render('Admin/Reports/Index', [
            'reports' => $reports
        ]);
    }

    public function destroy($id)
    {
        $report = Report::findOrFail($id);
        $report->delete();

        return redirect()->back()->with('success', 'Laporan berhasil dihapus.');
    }

    // --- FUNGSI UNTUK USER ---
    public function store(Request $request)
    {
        $request->validate([
            'book_id' => 'nullable|exists:books,id', 
            'reported_author_id' => 'required|exists:users,id',
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Cek duplikasi laporan (Prevent Spam)
        $exists = Report::where('user_id', Auth::id())
            ->where('reported_user_id', $request->reported_author_id)
            ->where('book_id', $request->book_id)
            ->where('status', 'pending')
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Anda sudah melaporkan hal ini dan sedang dalam peninjauan.');
        }

        Report::create([
            'user_id' => Auth::id(),
            'book_id' => $request->book_id,
            'reported_user_id' => $request->reported_author_id,
            'reason' => $request->reason,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        @Mail::to('nusabacaa@gmail.com')->send(new ReportNotification("Laporan Masuk Baru", "Ada laporan baru masuk ke sistem."));

        return redirect()->back()->with('success', 'Laporan berhasil dikirim.');
    }

    public function update(Request $request, $id)
    {   
        try {
            // DIMANA: Menambahkan eager loading 'book'
            // MENGAPA: Agar kita bisa mengambil judul buku untuk ditampilkan di notifikasi
            $report = Report::with('book')->findOrFail($id); 
            $report->status = $request->status;
            $report->save(); 

            if ($request->status === 'resolved') {
                $penulis = User::find($report->reported_user_id);
                $pelapor = User::find($report->user_id);

                $systemMessages = [
                    'PLAGIARISM' => 'SISTEM KAMI MENDETEKSI ADANYA INDIKASI PLAGIARISME TANPA IZIN PADA KARYA ANDA.',
                    'SPAM' => 'AKUN ANDA DILAPORKAN KARENA AKTIVITAS MASSAL.',
                    'INAPPROPRIATE CONTENT' => 'KONTEN YANG ANDA UNGGAH MELANGGAR PEDOMAN KOMUNITAS.',
                    'HARASSMENT' => 'SISTEM MENERIMA LAPORAN TERKAIT TINDAKAN PELECEHAN.',
                ];
                
                $dbReason = strtoupper(trim($report->reason));
                $pesanOtomatis = $systemMessages[$dbReason] ?? 'Akun Anda dilaporkan karena melanggar pedoman komunitas.';

                // Notifikasi Penulis (Terlapor)
                if ($penulis) {
                    $penulis->notify(new AktivitasNotifikasi([
                        'title'      => 'Peringatan Akun',
                        'message'    => $pesanOtomatis,
                        'url'        => '/history-laporan', // Ganti ke route banding nanti
                        'type'       => 'warning',
                        'category'   => $report->book_id ? 'buku' : 'user',
                        'book_title' => $report->book ? $report->book->title : null, // BAGIAN INI WAJIB ADA
                    ]));

                    $jumlahPelanggaran = Report::where('reported_user_id', $penulis->id)
                        ->where('status', 'resolved')
                        ->count();

                    if ($jumlahPelanggaran >= 3) {
                        $penulis->update(['is_banned' => true, 'status' => 'suspended']);
                    }
                }
            }

            return redirect()->back()->with('success', 'Status diperbarui!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function history()
    {
        $user = Auth::user();
        $systemMessages = [
            'PLAGIARISM' => 'SISTEM KAMI MENDETEKSI ADANYA INDIKASI PLAGIARISME TANPA IZIN PADA KARYA ANDA.',
            'SPAM' => 'AKUN ANDA DILAPORKAN KARENA AKTIVITAS MASSAL.',
            'INAPPROPRIATE CONTENT' => 'KONTEN YANG ANDA UNGGAH MELANGGAR PEDOMAN KOMUNITAS.',
            'HARASSMENT' => 'SISTEM MENERIMA LAPORAN TERKAIT TINDAKAN PELECEHAN.',
        ];

        // Audit: Menggunakan with(['reportedUser', 'book']) untuk efisiensi
        $data = Report::where('user_id', $user->id)
            ->orWhere('reported_user_id', $user->id)
            ->with(['reportedUser', 'book'])
            ->latest()
            ->get()
            ->map(function ($report) use ($user, $systemMessages) {
                $dbReason = strtoupper(trim($report->reason));
                $isWarning = $report->reported_user_id === $user->id;
                
                // Tentukan Kategori untuk Icon UI
                $category = $report->book_id ? 'buku' : 'user';
                
                return [
                    'id' => $report->id,
                    'category' => $category,
                    'type' => $isWarning ? 'warning' : 'info',
                    'title' => $isWarning ? 'Peringatan Akun' : 'Laporan Saya',
                    'message' => $isWarning 
                        ? ($systemMessages[$dbReason] ?? 'Peringatan pelanggaran komunitas.') 
                        : "Laporan terkait: " . $report->reason,
                    'status' => $report->status,
                    'created_at' => $report->created_at,
                    'reported_user' => $isWarning 
                        ? ['name' => 'Sistem NusaBaca', 'role' => 'system'] 
                        : $report->reportedUser,
                    'book' => $report->book,
                    'url' => $report->book_id ? route('author.books') : null,
                ];
            });

        return Inertia::render('Reports/History', [
            'reports' => ['data' => $data] 
        ]);
    }
}