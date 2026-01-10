<?php

namespace App\Http\Controllers;

use App\Models\WriterApplication;
use App\Mail\WriterStatusNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class WriterApplicationController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Writer/JoinWriter', [
            'application' => $request->user()->writerApplication ?? null
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'pen_name' => 'required|string|max:255',
            'bio' => 'required|string|min:20',
            'portfolio' => 'required|mimes:pdf|max:2048',
        ]);

        $path = $request->file('portfolio')->store('portfolios', 'public');

        WriterApplication::create([
            'user_id' => Auth::id(), 
            'pen_name' => $request->pen_name,
            'bio' => $request->bio,
            'message' => $path, // Anda menyimpan path di kolom 'message'
            'status' => 'pending',
        ]);

        return redirect()->back()->with('message', 'Pengajuan berhasil dikirim!');
    }

    public function adminIndex()
    {
        // PERBAIKAN: Ambil semua data (bukan hanya pending) agar Admin bisa melihat status terbaru
        $applications = WriterApplication::with('user')->latest()->get();

        return Inertia::render('Admin/WriterApplications', ['applications' => $applications]);
    }

public function updateStatus(Request $request, $id)
{
    // 1. Validasi input
    $request->validate([
        'status' => 'required|in:approved,rejected'
    ]);

    // 2. Cari aplikasi beserta datanya
    $application = WriterApplication::with('user')->findOrFail($id); 

    // 3. Update status aplikasi
    $application->update([
        'status' => $request->status 
    ]);

    // 4. Jika disetujui, update role user
    if ($request->status === 'approved') {
        $application->user()->update(['role' => 'penulis']);
    }

    // --- TAMBAHKAN KODE DI BAWAH INI ---
    try {
        // Mengirim email ke user yang bersangkutan (misal: wknxnda@gmail.com)
        Mail::to($application->user->email)->send(new WriterStatusNotification($application->user, $request->status));
    } catch (\Exception $e) {
        // Jika email gagal, sistem tetap jalan tapi mencatat error di log
        Log::error('Gagal mengirim email: ' . $e->getMessage());
    }
    // ----------------------------------

    return redirect()->back()->with('message', 'Status berhasil diperbarui dan email dikirim!');
}
}