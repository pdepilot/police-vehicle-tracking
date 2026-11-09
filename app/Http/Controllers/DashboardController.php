<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\FleetNotification;
use App\Models\FuelLog;
use App\Models\Maintenance;
use App\Models\Setting;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $totalVehicles = Vehicle::count();
        $availableVehicles = Vehicle::where('status', 'Available')->count();
        $activeTrips = Trip::where('status', 'Active')->count();
        $maintenanceCount = Vehicle::where('status', 'Maintenance')->count();
        $scheduledTrips = Trip::where('status', 'Scheduled')->count();
        $completedTrips = Trip::where('status', 'Completed')->count();

        $driversOnDuty = Driver::where('status', 'On Duty')->count();
        $totalDrivers = Driver::count();

        $recentTrips = Trip::orderBy('created_at', 'desc')->take(6)->get();
        $activeVehicles = Vehicle::where('status', 'On Trip')->take(5)->get();
        $notifications = FleetNotification::where('is_read', false)->take(5)->get();
        $settings = Setting::first();

        return view('dashboard', compact(
            'totalVehicles',
            'availableVehicles',
            'activeTrips',
            'maintenanceCount',
            'scheduledTrips',
            'completedTrips',
            'driversOnDuty',
            'totalDrivers',
            'recentTrips',
            'activeVehicles',
            'notifications',
            'settings'
        ));
    }
}

