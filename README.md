<p align="center">
  <img src="Screenshots/nusabaca-logo.png" width="300" alt="NusaBaca Branding">
</p>

# 📚 NusaBaca - Comprehensive Ebook & Moderation Ecosystem

**NusaBaca** adalah platform manajemen ebook Fullstack yang dibangun menggunakan arsitektur **Modern Monolith**. Project ini dirancang untuk menangani ekosistem penulis, pembaca, dan admin dengan fokus utama pada **keamanan akses**, **reaktivitas UI**, dan **moderasi konten terpusat**.

---

## 🛠️ Deep Technical Stack

- **Framework Core:** Laravel 11 (PHP 8.2+)
- **Frontend Bridge:** Inertia.js (Bridge React-Laravel)
- **UI Library:** React.js dengan Hooks & Tailwind CSS
- **State & Data Sharing:** Global Props via `HandleInertiaRequests` middleware
- **Database:** MySQL dengan Eloquent Relationship (One-to-Many & Polymorphic)
- **Real-Time:** Laravel Reverb (webSocket) & Laravel Echo

---

## 🛡️ Advance Security System (Highlight)

### 1. Real-time CheckBanned Middleware
Sistem ini menjamin keamanan akun dengan fitur *force-logout* instan. Begitu Admin mengubah status user menjadi "Banned", user akan langsung kehilangan akses pada request berikutnya:
- **Logic:** Mengecek status `is_banned` secara real-time di setiap siklus request.
- **Hard Reset:** Menggunakan `session()->invalidate()` dan `regenerateToken()` untuk memastikan session lama tidak bisa digunakan kembali.

### 2. Role-Based Access Control (RBAC)
Pemisahan hak akses yang sangat ketat menggunakan Middleware Laravel untuk tiga level pengguna: **Admin**, **Author**, dan **Pembaca**.

---

## 🚀 Fitur Unggulan (Full Feature List)

### 🎮 Gamification & Points System (New)
Sistem poin untuk meningkatkan keterlibatan penulis dan pembaca:
- **Poin Nusa:** Badge poin dinamis yang muncul di profil penulis, disinkronkan langsung dari database.
- **Real-time Sync:** Menghindari lag data session dengan melakukan query ulang pada `ProfileController`.
- **Clean UI:** Penanganan error input null menggunakan *nullish coalescing* untuk stabilitas tampilan.

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

### ⚡Real-Time System Integrity & Recet Audit Log 
Sistem ini mengimplementasikan **WebSocket & Laravel Echo** untuk memberikan transparansi administratif secara instan tanpa perlu refresh halaman:
- **Event-Driven:** Menggunakan Laravel Events (`AuditUpdated`) yang mengimplementasikan `ShouldBroadcastNow`.
- **WebSocket Server:** Ditenagai oleh **Laravel Reverb** untuk pengiriman data yang sangat cepat.
- **Client Side:** Menggunakan **Laravel Echo** untuk mendengarkan aktivitas moderasi (Approve/Reject) dan memperbarui tabel Audit secara reaktif.

---

## 🔧 Installation Guide

1. **Clone:** `git clone https://github.com/ketutaguswikananda22/NusaBaca.git`
2. **Backend Setup:** `composer install` & `php artisan key:generate`
3. **Frontend Setup:** `npm install && npm run dev`
4. **Database:** Atur konfigurasi `.env`, lalu jalankan `php artisan migrate --seed` dan `php artisan reverb` untuk fitur real-time
5. **Serve:** `php artisan serve`
---


*Dikembangkan oleh **Ketut Agus Wikananda** sebagai project portofolio Fullstack Development.*
---