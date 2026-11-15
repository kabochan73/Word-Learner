<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_record_a_game_session(): void
    {
        $response = $this->postJson('/game-sessions', [
            'grade' => '1',
            'score' => 10,
        ]);

        $response->assertUnauthorized();
    }

    public function test_authenticated_users_can_record_a_game_session(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/game-sessions', [
            'grade' => '1',
            'score' => 10,
        ]);

        $response->assertCreated();
        $response->assertJson(['score' => 10]);

        $this->assertDatabaseHas('game_sessions', [
            'user_id' => $user->id,
            'grade' => '1',
            'score' => 10,
        ]);
    }

    public function test_score_must_be_a_non_negative_integer(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/game-sessions', [
            'grade' => '1',
            'score' => -1,
        ]);

        $response->assertInvalid('score');
    }
}
