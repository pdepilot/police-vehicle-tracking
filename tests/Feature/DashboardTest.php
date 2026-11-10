<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_redirected_to_login(): void
    {
        $response = $this->get('/dashboard');
        $response->assertRedirect(route('login'));
    }

    public function test_dashboard_page_renders_successfully(): void
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);

        // Core title & live indicators
        $response->assertSee('Operations Dashboard');
        $response->assertSee('Live Telemetry Feed');
        $response->assertSee('Live Police Fleet Command Connected');

        // TravelBooking Layout & Shell components
        $response->assertSee('dash-shell', false);
        $response->assertSee('float-nav', false);
        $response->assertSee('admin-main', false);
        $response->assertSee('dash-topbar', false);
        $response->assertSee('topbar-crumb', false);
        $response->assertSee('admin-footer', false);
        $response->assertSee('travelbooking-admin.css', false);

        // TravelBooking Stat Grid & Cards
        $response->assertSee('stat-grid-6', false);
        $response->assertSee('stat-card', false);
        $response->assertSee('Total Fleet Units');
        $response->assertSee('Available / Standby');
        $response->assertSee('Active Patrol Units');
        $response->assertSee('Under Maintenance');
        $response->assertSee('Scheduled Dispatches');
        $response->assertSee('Completed Shifts');

        // TravelBooking Card Boxes & Content
        $response->assertSee('card-box', false);
        $response->assertSee('card-box-head', false);
        $response->assertSee('card-box-body', false);
        $response->assertSee('Vehicle Telemetrics Activity');
        $response->assertSee('Fleet Readiness Distribution');
        $response->assertSee('Live Fleet Telemetry Radar Map');
        $response->assertSee('Recent Dispatches');
        $response->assertSee('Priority Alerts');

        // TravelBooking Table & Activity List
        $response->assertSee('table-clean', false);
        $response->assertSee('activity-list', false);
    }
}
