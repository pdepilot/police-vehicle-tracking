<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FleetRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_fleet_views_render_with_layout(): void
    {
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
            $response = $this->get($route);
            $response->assertStatus(200);
            $response->assertSee('dash-shell', false);
            $response->assertSee('float-nav', false);
            $response->assertSee('dash-topbar', false);
        }
    }
}

