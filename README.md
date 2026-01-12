<div align="center">
  <table style="border: none; border-collapse: collapse;">
    <tr style="border: none;">
      <td style="border: none; padding: 0;">
        <img src="Screenshots/nusabaca1.jpeg" width="100" alt="NusaBaca Logo">
      </td>
      <td style="border: none; padding-left: 20px; vertical-align: middle;">
        <div style="font-size: 45px; font-weight: bold; font-family: sans-serif;">
          Nusa<font color="#ff6122">Baca</font>
        </div>
      </td>
    </tr>
  </table>
</div>

# 📚 NusaBaca - Comprehensive Ebook & Moderation Ecosystem

**NusaBaca** adalah platform manajemen ebook Fullstack yang dibangun menggunakan arsitektur **Modern Monolith**. Project ini dirancang untuk menangani ekosistem penulis, pembaca, dan admin dengan fokus utama pada **keamanan akses**, **reaktivitas UI**, dan **moderasi konten terpusat**.

---

## 🛠️ Deep Technical Stack

- **Framework Core:** Laravel 11 (PHP 8.2+)
- **Frontend Bridge:** Inertia.js (Menghubungkan React ke Laravel tanpa API manual)
- **UI Library:** React.js dengan Hooks & Tailwind CSS
- **State & Data Sharing:** Global Props via `HandleInertiaRequests` middleware
- **Database:** MySQL dengan Eloquent Relationship (One-to-Many & Polymorphic)

---

## 🛡️ Advance Security System (Highlight)

### 1. Real-time CheckBanned Middleware
Sistem ini menjamin keamanan akun dengan fitur *force-logout* instan. Begitu Admin mengubah status user menjadi "Banned", user akan langsung kehilangan akses pada request berikutnya:
- **Logic:** Mengecek status `is_banned` secara real-time di setiap siklus request.
- **Hard Reset:** Menggunakan `session()->invalidate()` dan `regenerateToken()` untuk memastikan session lama tidak bisa digunakan kembali.

### 2. Role-Based Access Control (RBAC)
Pemisahan hak akses yang sangat ketat menggunakan Middleware Laravel untuk tiga level pengguna: **Admin**, **Author**, dan **Pembaca**.

### 3. SEO FRIENDLY WITH GENRE FILTER
Fitur search yang sudah menerapkan SEO (Search Engine Optimization) dan filter buku berdasarkan genre
---

## 🚀 Fitur Unggulan (Full Feature List)

### 📊 Dashboard & Analytics (Admin)
- **Data Visualization:** Grafik dinamis yang memantau pertumbuhan buku dan statistik pengguna baru.
- **Real-time Overview:** Ringkasan aktivitas terbaru langsung di sidebar dashboard.

### ✍️ Content Lifecycle (Author)
- **Ebook Management:** CRUD lengkap untuk ebook (PDF upload, Genre, & Deskripsi).
- **Status Tracking:** Memantau status moderasi buku (Pending, Approved, Rejected) secara transparan.

### ⚖️ Moderation Suite (Admin)
- **Review System:** Admin dapat menyetujui atau menolak buku dengan menyertakan alasan spesifik yang akan muncul di notifikasi Author.
- **User Management:** Panel kontrol untuk mengaktifkan atau menonaktifkan akun user (Banned/Unbanned).

### 🔔 Notification & Interaction
- **In-App Notifications:** Sistem lonceng notifikasi reaktif di frontend.
- **Unread Counter:** Sinkronisasi jumlah notifikasi yang belum dibaca antara backend dan frontend melalui global props Inertia.

---

## 🔧 Installation Guide

1. **Clone:** `git clone https://github.com/ketutaguswikananda22/NusaBaca.git`
2. **Backend Setup:** `composer install` & `php artisan key:generate`
3. **Frontend Setup:** `npm install && npm run dev`
4. **Database:** Atur `.env`, lalu jalankan `php artisan migrate --seed`
5. **Serve:** `php artisan serve`
---
*Dikembangkan oleh **Ketut Agus Wikananda** sebagai project portofolio Fullstack Development.*