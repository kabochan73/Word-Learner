<?php

use App\Http\Controllers\GameSessionController;
use App\Http\Controllers\PlayController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/play', [PlayController::class, 'show'])->name('play');

Route::post('/game-sessions', [GameSessionController::class, 'store'])
    ->middleware('auth')
    ->name('game-sessions.store');

require __DIR__.'/auth.php';
