<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Maintenance::query();

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('id', 'like', "%{$s}%")
                    ->orWhere('vehicle_reg', 'like', "%{$s}%")
                    ->orWhere('type', 'like', "%{$s}%")
                    ->orWhere('provider', 'like', "%{$s}%")
                    ->orWhere('technician', 'like', "%{$s}%");
            });
        }

        $records = $query->orderBy('reported_date', 'desc')->get();
        $vehicles = Vehicle::all();

        $totalCost = Maintenance::sum('cost');
        $inProgressCount = Maintenance::where('status', 'In Progress')->count();
        $pendingCount = Maintenance::where('status', 'Pending')->count();
        $completedCount = Maintenance::where('status', 'Completed')->count();

        return view('maintenance.index', compact('records', 'vehicles', 'totalCost', 'inProgressCount', 'pendingCount', 'completedCount'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicle_id' => 'required|string',
            'type' => 'required|string',
            'description' => 'required|string',
            'cost' => 'required|numeric',
            'reported_date' => 'required|date',
            'service_date' => 'nullable|date',
            'next_service_date' => 'nullable|date',
            'provider' => 'nullable|string',
            'status' => 'required|string',
            'technician' => 'nullable|string',
        ]);

        $vehicle = Vehicle::findOrFail($data['vehicle_id']);
        $data['id'] = 'MNT-' . rand(310, 399);
        $data['vehicle_reg'] = $vehicle->registration;
        $data['vehicle_model'] = "{$vehicle->make} {$vehicle->model}";

        Maintenance::create($data);

        if ($data['status'] === 'In Progress' || $data['status'] === 'Pending') {
            $vehicle->status = 'Maintenance';
            $vehicle->save();
        }

        return redirect()->route('maintenance.index')->with('success', 'Work order logged successfully.');
    }

    public function updateStatus(Request $request, $id)
    {
        $mnt = Maintenance::findOrFail($id);
        $mnt->status = $request->input('status', 'Completed');
        $mnt->save();

        if ($mnt->status === 'Completed' && $mnt->vehicle_id) {
            $veh = Vehicle::find($mnt->vehicle_id);
            if ($veh) {
                $veh->status = 'Available';
                $veh->last_service_date = now()->format('Y-m-d');
                $veh->save();
            }
        }

        return back()->with('success', 'Maintenance status updated.');
    }

    public function destroy($id)
    {
        $mnt = Maintenance::findOrFail($id);
        $mnt->delete();
        return redirect()->route('maintenance.index')->with('success', 'Work order removed.');
    }
}

