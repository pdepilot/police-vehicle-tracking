<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function index()
    {
        $activeTrips = Trip::where('status', 'Active')->orderBy('departure_time', 'asc')->get();
        $scheduledTrips = Trip::where('status', 'Scheduled')->orderBy('departure_date', 'asc')->get();
        $availableVehicles = Vehicle::where('status', 'Available')->get();
        $availableDrivers = Driver::where('status', 'On Duty')->get();

        return view('trips.index', compact('activeTrips', 'scheduledTrips', 'availableVehicles', 'availableDrivers'));
    }

    public function history(Request $request)
    {
        $query = Trip::query();

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('id', 'like', "%{$s}%")
                    ->orWhere('vehicle_reg', 'like', "%{$s}%")
                    ->orWhere('driver_name', 'like', "%{$s}%")
                    ->orWhere('origin', 'like', "%{$s}%")
                    ->orWhere('destination', 'like', "%{$s}%")
                    ->orWhere('purpose', 'like', "%{$s}%");
            });
        }

        $trips = $query->orderBy('departure_date', 'desc')->orderBy('departure_time', 'desc')->paginate(15);

        return view('trips.history', compact('trips'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicle_id' => 'required|string',
            'driver_id' => 'required|string',
            'origin' => 'required|string',
            'destination' => 'required|string',
            'departure_date' => 'required|date',
            'departure_time' => 'required|string',
            'expected_arrival' => 'nullable|string',
            'purpose' => 'required|string',
            'priority' => 'required|string',
            'status' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $vehicle = Vehicle::findOrFail($data['vehicle_id']);
        $driver = Driver::findOrFail($data['driver_id']);

        $data['id'] = 'TRP-' . rand(4100, 4999);
        $data['vehicle_reg'] = $vehicle->registration;
        $data['call_sign'] = $vehicle->call_sign;
        $data['driver_name'] = $driver->full_name;
        $data['status'] = $data['status'] ?? 'Active';
        $data['distance_km'] = rand(15, 60);

        Trip::create($data);

        if ($data['status'] === 'Active') {
            $vehicle->status = 'On Trip';
            $vehicle->save();
        }

        return redirect()->route('trips.index')->with('success', 'Dispatch order successfully created.');
    }

    public function complete($id)
    {
        $trip = Trip::findOrFail($id);
        $trip->status = 'Completed';
        $trip->actual_arrival = now()->format('H:i');
        $trip->save();

        if ($trip->vehicle_id) {
            $veh = Vehicle::find($trip->vehicle_id);
            if ($veh) {
                $veh->status = 'Available';
                $veh->mileage += $trip->distance_km;
                $veh->save();
            }
        }

        return back()->with('success', 'Trip marked as completed and vehicle returned to available pool.');
    }

    public function cancel($id)
    {
        $trip = Trip::findOrFail($id);
        $trip->status = 'Cancelled';
        $trip->save();

        if ($trip->vehicle_id) {
            $veh = Vehicle::find($trip->vehicle_id);
            if ($veh) {
                $veh->status = 'Available';
                $veh->save();
            }
        }

        return back()->with('success', 'Trip dispatch cancelled.');
    }

    public function exportCsv()
    {
        $trips = Trip::orderBy('departure_date', 'desc')->get();
        $csvFileName = 'imo-police-manifest-archive-' . date('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$csvFileName\"",
        ];

        $callback = function () use ($trips) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Trip ID', 'Vehicle Reg', 'Call Sign', 'Driver', 'Origin', 'Destination', 'Date', 'Time', 'Arrival', 'Purpose', 'Priority', 'Status', 'Distance (KM)']);
            foreach ($trips as $t) {
                fputcsv($file, [
                    $t->id,
                    $t->vehicle_reg,
                    $t->call_sign,
                    $t->driver_name,
                    $t->origin,
                    $t->destination,
                    $t->departure_date,
                    $t->departure_time,
                    $t->actual_arrival ?? $t->expected_arrival,
                    $t->purpose,
                    $t->priority,
                    $t->status,
                    $t->distance_km
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

