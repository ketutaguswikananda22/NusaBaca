<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Facades\DB;

class PostService
{
    public function storePost(array $data, int $userId): Post
    {
        return DB::transaction(function () use ($data, $userId) {
            return Post::create([
                'title'   => $data['title'],
                'content' => $data['content'],
                'user_id' => $userId,
                'status'  => $data['status'] ?? 'draft',
            ]);
        });
    }

    public function updatePost(Post $post, array $data): bool
    {
        return DB::transaction(function () use ($post, $data) {
            return $post->update($data);
        });
    }
}