<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FleetRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_redirected_to_login_from_fleet_pages(): void
    {
        $response = $this->get('/vehicles');
        $response->assertRedirect(route('login'));
    }

    public function test_all_fleet_views_render_with_layout(): void
    {
        $user = User::factory()->create();

        $routes = [
            '/vehicles',
            '/drivers',
            '/tracking',
            '/trips',
            '/trip-history',
            '/maintenance',
            '/fuel',
            '/notifications',
            '/reports',
            '/settings',
        ];

        foreach ($routes as $route) {
            $response = $this->actingAs($user)->get($route);
            $response->assertStatus(200);
            $response->assertSee('dash-shell', false);
            $response->assertSee('float-nav', false);
            $response->assertSee('dash-topbar', false);
            $response->assertSee('command-navbar', false);
            $response->assertSee('command-nav-item active', false);
        }
    }

    public function test_vehicles_view_renders_commission_modal_correctly(): void
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->get('/vehicles');
        $response->assertStatus(200);
        $response->assertSee('id="vehicle-crud-modal"', false);
        $response->assertSee('modal-box lg', false);
        $response->assertSee('id="vehicle-modal-form"', false);
        $response->assertSee('modal-body', false);
        $response->assertSee('modal-footer', false);
        $response->assertSee('Save Vehicle Record', false);
        $response->assertSee('form-veh-registration', false);
        $response->assertSee('form-veh-callsign', false);
    }

    public function test_maintenance_view_has_no_hardcoded_values(): void
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->get('/maintenance');
        $response->assertStatus(200);
        $response->assertDontSee('value="450"', false);
        $response->assertDontSee('Master Tech J. Kowalski', false);
        $response->assertDontSee('Metro Fleet Central Workshop', false);
        $response->assertDontSee('10,000-Mile', false);
        $response->assertSee('id="maintenance-modal-form"', false);
        $response->assertSee('id="form-mnt-vehicle"', false);
        $response->assertSee('Save Service Order', false);
    }
}

