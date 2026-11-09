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

class FleetApiController extends Controller
{
    /**
     * Get all data in one payload for fast client hydration
     */
    public function all()
    {
        return response()->json([
            'vehicles' => Vehicle::orderBy('id', 'asc')->get(),
            'drivers' => Driver::orderBy('id', 'asc')->get(),
            'trips' => Trip::orderBy('created_at', 'desc')->get(),
            'maintenance' => Maintenance::orderBy('created_at', 'desc')->get(),
            'fuel' => FuelLog::orderBy('date', 'desc')->get(),
            'notifications' => FleetNotification::orderBy('created_at', 'desc')->get(),
            'settings' => Setting::first() ?? new Setting(),
        ]);
    }

    // --- VEHICLES ---
    public function getVehicles()
    {
        return response()->json(Vehicle::orderBy('id', 'asc')->get());
    }

    public function storeVehicle(Request $request)
    {
        $data = $request->all();
        if (empty($data['id'])) {
            $lastNum = Vehicle::count() + 101;
            $data['id'] = 'VEH-' . $lastNum;
        }

        // Default coordinates if missing
        $data['lat'] = $data['lat'] ?? 5.4851;
        $data['lng'] = $data['lng'] ?? 7.0355;
        $data['status'] = $data['status'] ?? 'Available';

        $vehicle = Vehicle::create($data);

        // Notify
        FleetNotification::create([
            'id' => 'NOTIF-' . (rand(100, 999)),
            'title' => 'New Vehicle Commissioned',
            'message' => "Vehicle {$vehicle->registration} ({$vehicle->make} {$vehicle->model}) was registered into {$vehicle->department}.",
            'type' => 'assignment',
            'timestamp' => now()->format('Y-m-d H:i'),
            'is_read' => false,
        ]);

        return response()->json(['success' => true, 'vehicle' => $vehicle]);
    }

    public function updateVehicle(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->update($request->all());
        return response()->json(['success' => true, 'vehicle' => $vehicle]);
    }

    public function deleteVehicle($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();
        return response()->json(['success' => true]);
    }

    public function toggleSiren($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->siren_active = !$vehicle->siren_active;
        $vehicle->save();

        if ($vehicle->siren_active) {
            FleetNotification::create([
                'id' => 'NOTIF-' . (rand(100, 999)),
                'title' => 'Emergency Siren Activated',
                'message' => "Vehicle {$vehicle->registration} ({$vehicle->call_sign}) activated pursuit siren.",
                'type' => 'alert',
                'timestamp' => now()->format('Y-m-d H:i'),
                'is_read' => false,
            ]);
        }

        return response()->json(['success' => true, 'siren_active' => $vehicle->siren_active]);
    }

    public function updateTelemetry(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->update($request->only(['lat', 'lng', 'speed', 'heading', 'fuel_level', 'battery_level']));
        return response()->json(['success' => true, 'vehicle' => $vehicle]);
    }

    // --- DRIVERS ---
    public function getDrivers()
    {
        return response()->json(Driver::orderBy('id', 'asc')->get());
    }

    public function storeDriver(Request $request)
    {
        $data = $request->all();
        if (empty($data['id'])) {
            $data['id'] = 'DRV-' . sprintf('%02d', Driver::count() + 1);
        }
        $driver = Driver::create($data);

        FleetNotification::create([
            'id' => 'NOTIF-' . (rand(100, 999)),
            'title' => 'New Officer Enrolled',
            'message' => "Officer {$driver->first_name} {$driver->last_name} (Badge: {$driver->badge_number}) registered into {$driver->department}.",
            'type' => 'update',
            'timestamp' => now()->format('Y-m-d H:i'),
            'is_read' => false,
        ]);

        return response()->json(['success' => true, 'driver' => $driver]);
    }

    public function updateDriver(Request $request, $id)
    {
        $driver = Driver::findOrFail($id);
        $driver->update($request->all());
        return response()->json(['success' => true, 'driver' => $driver]);
    }

    public function deleteDriver($id)
    {
        $driver = Driver::findOrFail($id);
        $driver->delete();
        return response()->json(['success' => true]);
    }

    // --- TRIPS ---
    public function getTrips()
    {
        return response()->json(Trip::orderBy('created_at', 'desc')->get());
    }

    public function storeTrip(Request $request)
    {
        $data = $request->all();
        if (empty($data['id'])) {
            $data['id'] = 'TRP-' . rand(4100, 4999);
        }
        $trip = Trip::create($data);

        // Update vehicle status
        if (!empty($trip->vehicle_id)) {
            $veh = Vehicle::find($trip->vehicle_id);
            if ($veh) {
                $veh->status = 'On Trip';
                $veh->save();
            }
        }

        FleetNotification::create([
            'id' => 'NOTIF-' . (rand(100, 999)),
            'title' => 'Dispatch Order Assigned',
            'message' => "Trip {$trip->id} dispatched: Unit {$trip->vehicle_reg} to {$trip->destination} under {$trip->driver_name}.",
            'type' => 'assignment',
            'timestamp' => now()->format('Y-m-d H:i'),
            'is_read' => false,
        ]);

        return response()->json(['success' => true, 'trip' => $trip]);
    }

    public function updateTrip(Request $request, $id)
    {
        $trip = Trip::findOrFail($id);
        $trip->update($request->all());

        if ($request->input('status') === 'Completed' && $trip->vehicle_id) {
            $veh = Vehicle::find($trip->vehicle_id);
            if ($veh) {
                $veh->status = 'Available';
                if ($trip->distance_km > 0) {
                    $veh->mileage += $trip->distance_km;
                }
                $veh->save();
            }

            FleetNotification::create([
                'id' => 'NOTIF-' . (rand(100, 999)),
                'title' => 'Trip Completed Successfully',
                'message' => "Mission {$trip->id} completed by {$trip->driver_name}. Vehicle {$trip->vehicle_reg} returned.",
                'type' => 'completed',
                'timestamp' => now()->format('Y-m-d H:i'),
                'is_read' => false,
            ]);
        }

        return response()->json(['success' => true, 'trip' => $trip]);
    }

    public function deleteTrip($id)
    {
        $trip = Trip::findOrFail($id);
        $trip->delete();
        return response()->json(['success' => true]);
    }

    // --- MAINTENANCE ---
    public function getMaintenance()
    {
        return response()->json(Maintenance::orderBy('created_at', 'desc')->get());
    }

    public function storeMaintenance(Request $request)
    {
        $data = $request->all();
        if (empty($data['id'])) {
            $data['id'] = 'MNT-' . rand(310, 399);
        }
        $mnt = Maintenance::create($data);

        if ($mnt->vehicle_id && ($mnt->status === 'In Progress' || $mnt->status === 'Pending')) {
            $veh = Vehicle::find($mnt->vehicle_id);
            if ($veh) {
                $veh->status = 'Maintenance';
                $veh->save();
            }
        }

        FleetNotification::create([
            'id' => 'NOTIF-' . (rand(100, 999)),
            'title' => 'Maintenance Logged',
            'message' => "Work order {$mnt->id} ({$mnt->type}) logged for {$mnt->vehicle_reg}.",
            'type' => 'maintenance',
            'timestamp' => now()->format('Y-m-d H:i'),
            'is_read' => false,
        ]);

        return response()->json(['success' => true, 'maintenance' => $mnt]);
    }

    public function updateMaintenance(Request $request, $id)
    {
        $mnt = Maintenance::findOrFail($id);
        $mnt->update($request->all());

        if ($mnt->status === 'Completed' && $mnt->vehicle_id) {
            $veh = Vehicle::find($mnt->vehicle_id);
            if ($veh) {
                $veh->status = 'Available';
                $veh->last_service_date = now()->format('Y-m-d');
                $veh->save();
            }
        }

        return response()->json(['success' => true, 'maintenance' => $mnt]);
    }

    public function deleteMaintenance($id)
    {
        $mnt = Maintenance::findOrFail($id);
        $mnt->delete();
        return response()->json(['success' => true]);
    }

    // --- FUEL ---
    public function getFuel()
    {
        return response()->json(FuelLog::orderBy('date', 'desc')->get());
    }

    public function storeFuel(Request $request)
    {
        $data = $request->all();
        if (empty($data['id'])) {
            $data['id'] = 'FUL-' . rand(510, 599);
        }
        $fuel = FuelLog::create($data);

        if ($fuel->vehicle_id) {
            $veh = Vehicle::find($fuel->vehicle_id);
            if ($veh) {
                $veh->fuel_level = 100;
                if ($fuel->mileage > $veh->mileage) {
                    $veh->mileage = $fuel->mileage;
                }
                $veh->save();
            }
        }

        return response()->json(['success' => true, 'fuel' => $fuel]);
    }

    public function deleteFuel($id)
    {
        $fuel = FuelLog::findOrFail($id);
        $fuel->delete();
        return response()->json(['success' => true]);
    }

    // --- NOTIFICATIONS ---
    public function getNotifications()
    {
        return response()->json(FleetNotification::orderBy('created_at', 'desc')->get());
    }

    public function markNotificationRead($id)
    {
        $notif = FleetNotification::findOrFail($id);
        $notif->is_read = true;
        $notif->save();
        return response()->json(['success' => true]);
    }

    public function markAllNotificationsRead()
    {
        FleetNotification::where('is_read', false)->update(['is_read' => true]);
        return response()->json(['success' => true]);
    }

    public function deleteNotification($id)
    {
        $notif = FleetNotification::findOrFail($id);
        $notif->delete();
        return response()->json(['success' => true]);
    }

    public function testNotification()
    {
        $notif = FleetNotification::create([
            'id' => 'NOTIF-' . rand(110, 999),
            'title' => 'Test Emergency Dispatch Alert',
            'message' => 'Simulated 10-33 Officer in Distress distress beacon triggered on sector 4.',
            'type' => 'alert',
            'timestamp' => now()->format('Y-m-d H:i'),
            'is_read' => false,
        ]);
        return response()->json(['success' => true, 'notification' => $notif]);
    }

    // --- SETTINGS & SYSTEM ---
    public function getSettings()
    {
        $setting = Setting::first() ?? new Setting();
        return response()->json($setting);
    }

    public function saveSettings(Request $request)
    {
        $setting = Setting::first();
        if (!$setting) {
            $setting = Setting::create($request->all());
        } else {
            $setting->update($request->all());
        }
        return response()->json(['success' => true, 'settings' => $setting]);
    }

    public function resetDatabase()
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

        return response()->json(['success' => true, 'message' => 'Database reset to default seeds.']);
    }

    public function backupDatabase()
    {
        $data = [
            'backup_timestamp' => now()->toIso8601String(),
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
