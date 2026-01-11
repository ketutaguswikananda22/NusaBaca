<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
public function run(): void
{
    // 1. Buat Data Genre (Penting agar filter di atas muncul)
    $genres = ['Fantasy', 'Adventure', 'Mystery', 'Technology', 'Romance', 'Horor'];
    foreach ($genres as $genreName) {
        \App\Models\Genre::updateOrCreate(
            ['slug' => \Illuminate\Support\Str::slug($genreName)],
            ['name' => $genreName]
        );
    }

    // 2. Buat User Admin (Akun Kamu)
    $admin = \App\Models\User::create([
        'name' => 'NusaBaca',
        'email' => 'nusabacaa@gmail.com',
        'password' => bcrypt('NusaBac@22'),
        'role' => 'admin',
        
    ]);

    }
    
}
