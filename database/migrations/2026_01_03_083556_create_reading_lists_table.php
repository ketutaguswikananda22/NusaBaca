<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    // Tabel untuk Nama Daftar Bacaan (Contoh: "My Favorites")
    Schema::create('reading_lists', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('name'); 
        $table->timestamps();
    });

    // Tabel Pivot (Penghubung) antara Daftar Bacaan dan Buku
    Schema::create('book_reading_list', function (Blueprint $table) {
        $table->id();
        $table->foreignId('reading_list_id')->constrained()->onDelete('cascade');
        $table->foreignId('book_id')->constrained()->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reading_lists');
    }
};
