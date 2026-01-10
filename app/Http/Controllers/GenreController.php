<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GenreController extends Controller
{

    public function index()
    {
        return Inertia::render('Admin/GenreManagement', [
            'genres' => \App\Models\Genre::orderBy('name', 'asc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:genres|max:50',
        ]);

        Genre::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return back()->with('success', 'Genre berhasil ditambahkan!');
    }

    public function update(Request $request, Genre $genre)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:genres,name,' . $genre->id,
        ]);

        $genre->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return back()->with('success', 'Genre berhasil diperbarui!');
    }

    public function destroy(Genre $genre)
    {
        $genre->delete();
        return back()->with('success', 'Genre berhasil dihapus!');
    }
}
