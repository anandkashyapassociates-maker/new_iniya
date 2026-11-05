<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

// 1. One-click browser helper to create storage symlink without SSH/Terminal
Route::get('/fix-storage-link', function () {
    try {
        Artisan::call('storage:link');
        return response()->json([
            'status' => 'success',
            'message' => 'Storage link successfully created!',
            'exists' => file_exists(public_path('storage')),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});

// 2. Fallback direct storage file server (in case symlink is missing or blocked on hosting)
Route::get('/storage/{path}', function (string $path) {
    $filePath = storage_path('app/public/'.ltrim($path, '/'));

    if (! file_exists($filePath)) {
        abort(404);
    }

    return response()->file($filePath);
})->where('path', '.*');

// 3. SPA Fallback
Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }

    return view('welcome');
})->where('any', '^(?!api|sanctum|up|fix-storage-link).*$');
