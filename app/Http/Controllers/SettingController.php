<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Setting;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class SettingController extends Controller
{
    /**
     * Display the settings index view.
     */
    public function index(): View
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

    /**
     * Update terminal and interface preferences.
     */
    public function update(Request $request): RedirectResponse
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

    /**
     * Update administrator login credentials (badge number, email, passcode).
     */
    public function updateCredentials(Request $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'badge_number' => ['required', 'string', 'max:50', Rule::unique('users', 'badge_number')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'current_password' => ['required', 'string'],
            'new_password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors([
                'current_password' => 'The provided current passcode does not match our records.',
            ])->withInput($request->except(['current_password', 'new_password', 'new_password_confirmation']));
        }

        $user->name = $request->name;
        $user->badge_number = $request->badge_number;
        $user->email = $request->email;

        if ($request->filled('new_password')) {
            $user->password = Hash::make($request->new_password);
        }

        $user->save();

        $setting = Setting::first();
        if ($setting) {
            $setting->update([
                'commander_name' => $user->name,
                'commander_badge' => $user->badge_number,
                'commander_email' => $user->email,
            ]);
        }

        return back()->with('success', 'Admin login credentials updated successfully. You can now authenticate with your updated Service ID, Email, or Passcode.');
    }
}
