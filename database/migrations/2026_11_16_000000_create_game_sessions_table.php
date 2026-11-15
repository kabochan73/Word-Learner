<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // grade: どの級でプレイしたかを表す文字列。有効な値の一覧はバックエンドでは
            // 持たず、frontendのlib/customize/words/だけが知っている。
            $table->string('grade', 20);
            $table->unsignedInteger('score');
            $table->timestamps();

            $table->index(['grade', 'score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
    }
};
