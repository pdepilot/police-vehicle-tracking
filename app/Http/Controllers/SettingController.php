<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\FleetNotification;
use App\Models\FuelLog;
use App\Models\Maintenance;
use App\Models\Setting;
use App\Models\Trip;
use App\Models\Vehicle;
use Database\Seeders\PoliceFleetSeeder;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::first() ?? new Setting();
        $vehicleCount = Vehicle::count();
        $driverCount = Driver::count();
        $tripCount = Trip::count();

        return view('settings.index', compact('settings', 'vehicleCount', 'driverCount', 'tripCount'));
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'commander_name' => 'required|string',
            'commander_badge' => 'required|string',
            'commander_email' => 'required|email',
            'department' => 'required|string',
            'terminal_id' => 'required|string',
            'theme' => 'required|string|in:light,dark',
            'speed_unit' => 'required|string|in:KMH,MPH',
            'telemetry_refresh_rate' => 'required|integer',
            'audio_alerts' => 'nullable|boolean',
            'auto_assign_tracking' => 'nullable|boolean',
        ]);

        $data['audio_alerts'] = $request->boolean('audio_alerts');
        $data['auto_assign_tracking'] = $request->boolean('auto_assign_tracking');

        $setting = Setting::first();
        if (!$setting) {
            Setting::create($data);
        } else {
            $setting->update($data);
        }

        return back()->with('success', 'Terminal & Command settings saved.');
    }

    public function reset()
    {
        Vehicle::truncate();
        Driver::truncate();
        Trip::truncate();
        Maintenance::truncate();
        FuelLog::truncate();
        FleetNotification::truncate();
        Setting::truncate();

        $seeder = new PoliceFleetSeeder();
        $seeder->run();

        return redirect()->route('dashboard')->with('success', 'System restored to default Imo Command police fleet seeds.');
    }

    public function backup()
    {
        $data = [
            'backup_timestamp' => now()->toIso8601String(),
            'department' => 'Nigeria Police Force — Imo State Command',
            'vehicles' => Vehicle::all(),
            'drivers' => Driver::all(),
            'trips' => Trip::all(),
            'maintenance' => Maintenance::all(),
            'fuel' => FuelLog::all(),
            'notifications' => FleetNotification::all(),
            'settings' => Setting::first(),
        ];

        $json = json_encode($data, JSON_PRETTY_PRINT);
        $fileName = 'police-car-tracker-backup-' . date('Y-m-d-His') . '.json';

        return response($json, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => "attachment; filename=\"$fileName\"",
        ]);
    }
}

