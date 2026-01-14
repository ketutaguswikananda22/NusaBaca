<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('admin-logs', function () {
    return true; // Sementara izinkan semua untuk dengerin
});
