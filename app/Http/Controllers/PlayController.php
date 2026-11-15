<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class PlayController extends Controller
{
    /**
     * Display the game screen.
     *
     * The backend only checks that grade is present and mode is a known
     * value; it has no list of valid grades, so Pages/Play.tsx is
     * responsible for checking the grade actually exists.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $validator = Validator::make($request->query(), [
            'grade' => ['required', 'string'],
            'mode' => ['required', 'in:practice,challenge'],
        ]);

        if ($validator->fails()) {
            return redirect('/');
        }

        $validated = $validator->validated();

        return Inertia::render('Play', [
            'grade' => $validated['grade'],
            'mode' => $validated['mode'],
        ]);
    }
}
