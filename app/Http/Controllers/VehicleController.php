<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $query = Vehicle::query();

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('department') && $request->department !== 'All') {
            $query->where('department', $request->department);
        }

        if ($request->filled('type') && $request->type !== 'All') {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('registration', 'like', "%{$s}%")
                    ->orWhere('call_sign', 'like', "%{$s}%")
                    ->orWhere('make', 'like', "%{$s}%")
                    ->orWhere('model', 'like', "%{$s}%")
                    ->orWhere('assigned_driver_name', 'like', "%{$s}%");
            });
        }

        $vehicles = $query->orderBy('id', 'asc')->get();
        $drivers = Driver::where('status', 'On Duty')->get();

        return view('vehicles.index', compact('vehicles', 'drivers'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'registration' => 'required|string|unique:vehicles,registration',
            'call_sign' => 'nullable|string',
            'make' => 'required|string',
            'model' => 'required|string',
            'year' => 'nullable|integer',
            'type' => 'required|string',
            'department' => 'required|string',
            'vin' => 'nullable|string',
            'mileage' => 'nullable|integer',
            'fuel_capacity' => 'nullable|numeric',
            'assigned_driver_id' => 'nullable|string',
            'status' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if (empty($data['id'])) {
            $data['id'] = 'VEH-' . (Vehicle::count() + 101);
        }

        if (!empty($data['assigned_driver_id'])) {
            $driver = Driver::find($data['assigned_driver_id']);
            if ($driver) {
                $data['assigned_driver_name'] = $driver->full_name;
            }
        }

        $data['lat'] = 5.4851;
        $data['lng'] = 7.0355;
        $data['status'] = $data['status'] ?? 'Available';

        Vehicle::create($data);

        return redirect()->route('vehicles.index')->with('success', 'Vehicle successfully commissioned into fleet.');
    }

    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $data = $request->validate([
            'registration' => 'required|string|unique:vehicles,registration,' . $id,
            'call_sign' => 'nullable|string',
            'make' => 'required|string',
            'model' => 'required|string',
            'year' => 'nullable|integer',
            'type' => 'required|string',
            'department' => 'required|string',
            'vin' => 'nullable|string',
            'mileage' => 'nullable|integer',
            'assigned_driver_id' => 'nullable|string',
            'status' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if (!empty($data['assigned_driver_id'])) {
            $driver = Driver::find($data['assigned_driver_id']);
            if ($driver) {
                $data['assigned_driver_name'] = $driver->full_name;
            }
        }

        $vehicle->update($data);

        return redirect()->route('vehicles.index')->with('success', 'Vehicle record updated successfully.');
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();
        return redirect()->route('vehicles.index')->with('success', 'Vehicle decommissioned and removed.');
    }
}

