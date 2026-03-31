<?php

use App\Http\Controllers\GoogleAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

Route::get('/{path?}', function () {
    $spaIndex = public_path('index.html');

    if (is_file($spaIndex)) {
        return response()->file($spaIndex);
    }

    return view('welcome');
})->where('path', '^(?!api|auth).*$');
