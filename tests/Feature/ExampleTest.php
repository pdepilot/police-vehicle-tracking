<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_user_can_login_with_email_or_badge_number(): void
    {
        $user = User::factory()->create([
            'email' => 'officer@police.gov.ng',
            'badge_number' => 'NPF-999',
            'password' => Hash::make('secret-code'),
        ]);

        // Login with email
        $response = $this->post('/login', [
            'email' => 'officer@police.gov.ng',
            'password' => 'secret-code',
        ]);
        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);

        auth()->logout();

        // Login with badge number
        $response = $this->post('/login', [
            'email' => 'NPF-999',
            'password' => 'secret-code',
        ]);
        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $response = $this->from('/login')->post('/login', [
            'email' => 'nonexistent@police.gov.ng',
            'password' => 'wrong-passcode',
        ]);

        $response->assertRedirect('/login');
        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }
}
