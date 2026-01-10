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
    Schema::table('users', function (Blueprint $table) {
        // Cek dulu apakah kolom sudah ada, jika belum baru tambahkan
        if (!Schema::hasColumn('users', 'website')) {
            $table->string('website')->nullable()->after('instagram');
        }
        if (!Schema::hasColumn('users', 'location')) {
            $table->string('location')->nullable()->after('website');
        }
        if (!Schema::hasColumn('users', 'gender')) {
            $table->string('gender')->nullable()->after('location');
        }
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['website', 'location', 'gender']);
    });
}
};
