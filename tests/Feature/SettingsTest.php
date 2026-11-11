<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_settings(): void
    {
        $response = $this->get('/settings');
        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_view_settings_page(): void
    {
        $user = User::factory()->create([
            'name' => 'Inspector General',
            'badge_number' => 'NPF-IG-001',
            'email' => 'ig@police.gov.ng',
        ]);

        $response = $this->actingAs($user)->get('/settings');
        $response->assertStatus(200);
        $response->assertSee('Admin Login & Access Credentials', false);
        $response->assertSee('NPF-IG-001');
        $response->assertSee('ig@police.gov.ng');
    }

    public function test_admin_can_update_login_details_with_valid_current_password(): void
    {
        $user = User::factory()->create([
            'name' => 'Commander Alpha',
            'badge_number' => 'NPF-OLD-111',
            'email' => 'old.email@police.gov.ng',
            'password' => Hash::make('CURRENT-PASS-123'),
        ]);

        Setting::create([
            'commander_name' => 'Commander Alpha',
            'commander_badge' => 'NPF-OLD-111',
            'commander_email' => 'old.email@police.gov.ng',
        ]);

        $response = $this->actingAs($user)->post('/settings/credentials', [
            'name' => 'Commander Omega',
            'badge_number' => 'NPF-NEW-999',
            'email' => 'new.email@police.gov.ng',
            'current_password' => 'CURRENT-PASS-123',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $user->refresh();
        $this->assertEquals('Commander Omega', $user->name);
        $this->assertEquals('NPF-NEW-999', $user->badge_number);
        $this->assertEquals('new.email@police.gov.ng', $user->email);
        $this->assertTrue(Hash::check('CURRENT-PASS-123', $user->password));

        // Setting model synchronized
        $setting = Setting::first();
        $this->assertEquals('Commander Omega', $setting->commander_name);
        $this->assertEquals('NPF-NEW-999', $setting->commander_badge);
        $this->assertEquals('new.email@police.gov.ng', $setting->commander_email);
    }

    public function test_admin_can_change_login_password(): void
    {
        $user = User::factory()->create([
            'email' => 'commander@police.gov.ng',
            'badge_number' => 'NPF-IMO-001',
            'password' => Hash::make('OLD-PASS-123'),
        ]);

        $response = $this->actingAs($user)->post('/settings/credentials', [
            'name' => $user->name,
            'badge_number' => $user->badge_number,
            'email' => $user->email,
            'current_password' => 'OLD-PASS-123',
            'new_password' => 'NEW-SECURE-999',
            'new_password_confirmation' => 'NEW-SECURE-999',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $user->refresh();
        $this->assertTrue(Hash::check('NEW-SECURE-999', $user->password));

        // Test logging in with newly changed password
        auth()->logout();

        $loginResponse = $this->post('/login', [
            'email' => 'NPF-IMO-001',
            'password' => 'NEW-SECURE-999',
        ]);
        $loginResponse->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_updating_credentials_fails_with_invalid_current_password(): void
    {
        $user = User::factory()->create([
            'badge_number' => 'NPF-ORIGINAL',
            'email' => 'original@police.gov.ng',
            'password' => Hash::make('CORRECT-PASS'),
        ]);

        $response = $this->actingAs($user)->from('/settings')->post('/settings/credentials', [
            'name' => 'New Name',
            'badge_number' => 'NPF-NEW-FAIL',
            'email' => 'newfail@police.gov.ng',
            'current_password' => 'WRONG-PASS',
        ]);

        $response->assertRedirect('/settings');
        $response->assertSessionHasErrors('current_password');

        $user->refresh();
        $this->assertEquals('NPF-ORIGINAL', $user->badge_number);
    }

    public function test_updating_credentials_fails_if_badge_or_email_already_taken(): void
    {
        User::factory()->create([
            'badge_number' => 'NPF-TAKEN-BADGE',
            'email' => 'taken@police.gov.ng',
        ]);

        $user = User::factory()->create([
            'badge_number' => 'NPF-MY-BADGE',
            'email' => 'mine@police.gov.ng',
            'password' => Hash::make('MY-PASS-123'),
        ]);

        // Attempt duplicate badge
        $response = $this->actingAs($user)->post('/settings/credentials', [
            'name' => $user->name,
            'badge_number' => 'NPF-TAKEN-BADGE',
            'email' => 'mine@police.gov.ng',
            'current_password' => 'MY-PASS-123',
        ]);
        $response->assertSessionHasErrors('badge_number');

        // Attempt duplicate email
        $response = $this->actingAs($user)->post('/settings/credentials', [
            'name' => $user->name,
            'badge_number' => 'NPF-MY-BADGE',
            'email' => 'taken@police.gov.ng',
            'current_password' => 'MY-PASS-123',
        ]);
        $response->assertSessionHasErrors('email');
    }
}
