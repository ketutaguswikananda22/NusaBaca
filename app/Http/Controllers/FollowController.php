<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    public function follow(User $user)
    {
/** @var \App\Models\User $follower */
$follower = Auth::user();
        
        // Cek agar tidak follow diri sendiri
        if ($follower->id !== $user->id) {
            // toggle() atau syncWithoutDetaching() agar tidak double
            $follower->following()->syncWithoutDetaching([$user->id]);
        }

        return back(); // Penting agar Inertia merefresh data props otomatis
    }

    public function unfollow(User $user)
    {
        
        $follower = Auth::user();
        $follower->following()->detach($user->id);

        return back();
    }
}
