<?php

namespace App\Actions\GameSession;

use App\Models\GameSession;
use App\Models\User;

class RecordGameSession
{
    public function execute(User $user, string $grade, int $score): GameSession
    {
        return GameSession::create([
            'user_id' => $user->id,
            'grade' => $grade,
            'score' => $score,
        ]);
    }
}
