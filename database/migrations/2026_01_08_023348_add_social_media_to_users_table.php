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
        $table->string('tiktok')->nullable()->after('instagram');
        $table->string('linkedin')->nullable()->after('tiktok');
        $table->string('twitter')->nullable()->after('linkedin');
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['tiktok', 'linkedin', 'twitter']);
    });
}
};
