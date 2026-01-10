<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
 public function up()
{
    Schema::create('reports', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Pelapor
        $table->foreignId('book_id')->nullable()->constrained()->onDelete('cascade'); // Boleh kosong
        $table->foreignId('reported_user_id')->nullable()->constrained('users')->onDelete('cascade'); // User yang dilaporkan
        $table->string('reason');
        $table->text('description')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
