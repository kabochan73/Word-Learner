<?php

namespace App\Http\Controllers;

use App\Actions\GameSession\RecordGameSession;
use App\Http\Requests\GameSession\StoreGameSessionRequest;
use Illuminate\Http\JsonResponse;

class GameSessionController extends Controller
{
    /**
     * Save a finished challenge-mode play (grade + score). Auth required;
     * the frontend only calls this for challenge mode + logged-in users.
     */
    public function store(
        StoreGameSessionRequest $request,
        RecordGameSession $recordGameSession,
    ): JsonResponse {
        $validated = $request->validated();

        $gameSession = $recordGameSession->execute(
            $request->user(),
            $validated['grade'],
            $validated['score'],
        );

        return response()->json(['score' => $gameSession->score], 201);
    }
}
