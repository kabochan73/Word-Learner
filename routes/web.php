<?php

use App\Http\Controllers\GameSessionController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PlayController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/play', [PlayController::class, 'show'])->name('play');

Route::post('/game-sessions', [GameSessionController::class, 'store'])
    ->middleware('auth')
    ->name('game-sessions.store');

require __DIR__.'/auth.php';
