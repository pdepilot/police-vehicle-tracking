<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Setting;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::first() ?? new Setting();
        $vehicleCount = Vehicle::count();
        $driverCount = Driver::count();
        $tripCount = Trip::count();

        return view('settings.index', compact(
            'settings',
            'vehicleCount',
            'driverCount',
            'tripCount'
        ));
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
}
