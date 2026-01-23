<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Services\PostService;
use App\Http\Requests\StorePostRequest;
use Illuminate\Http\RedirectResponse;

class PostController extends Controller
{
    protected PostService $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    public function store(StorePostRequest $request): RedirectResponse
    {
        // 1. Validasi otomatis lewat StorePostRequest
        // 2. Jalankan Logika lewat Service
        $this->postService->storePost($request->validated(), auth()->id());

        return redirect()->back()->with('success', 'Postingan berhasil disimpan.');
    }

    public function update(StorePostRequest $request, Post $post): RedirectResponse
    {
        // 3. Cek Izin lewat Policy
        $this->authorize('update', $post);

        // 4. Update lewat Service
        $this->postService->updatePost($post, $request->validated());

        return redirect()->back()->with('success', 'Postingan diperbarui.');
    }
}