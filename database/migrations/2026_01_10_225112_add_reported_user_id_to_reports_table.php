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
    Schema::table('reports', function (Blueprint $table) {
        // 1. Tambahkan kolom baru untuk ID user yang dilaporkan
        $table->foreignId('reported_user_id')->after('book_id')->nullable()->constrained('users')->onDelete('cascade');
        
        // 2. Ubah book_id agar boleh kosong (nullable)
        $table->foreignId('book_id')->nullable()->change();
    });
}

public function down(): void
{
    Schema::table('reports', function (Blueprint $table) {
        $table->dropForeign(['reported_user_id']);
        $table->dropColumn('reported_user_id');
        $table->foreignId('book_id')->nullable(false)->change();
    });
}
};
