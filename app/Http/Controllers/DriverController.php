<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index(Request $request)
    {
        $query = Driver::query();

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('department') && $request->department !== 'All') {
            $query->where('department', $request->department);
        }

        if ($request->filled('rank') && $request->rank !== 'All') {
            $query->where('rank', $request->rank);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                    ->orWhere('last_name', 'like', "%{$s}%")
                    ->orWhere('badge_number', 'like', "%{$s}%")
                    ->orWhere('rank', 'like', "%{$s}%");
            });
        }

        $drivers = $query->orderBy('id', 'asc')->get();
        $vehicles = Vehicle::where('status', 'Available')->get();

        return view('drivers.index', compact('drivers', 'vehicles'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'badge_number' => 'required|string|unique:drivers,badge_number',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'rank' => 'required|string',
            'department' => 'required|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'status' => 'required|string',
            'license_class' => 'nullable|string',
            'evoc_level' => 'nullable|string',
            'assigned_vehicle_id' => 'nullable|string',
            'years_of_service' => 'nullable|integer',
        ]);

        if (empty($data['id'])) {
            $data['id'] = 'DRV-' . sprintf('%02d', Driver::count() + 1);
        }

        if (!empty($data['assigned_vehicle_id'])) {
            $v = Vehicle::find($data['assigned_vehicle_id']);
            if ($v) {
                $data['assigned_vehicle_reg'] = $v->registration;
            }
        }

        Driver::create($data);

        return redirect()->route('drivers.index')->with('success', 'Officer enrolled into roster.');
    }

    public function update(Request $request, $id)
    {
        $driver = Driver::findOrFail($id);

        $data = $request->validate([
            'badge_number' => 'required|string|unique:drivers,badge_number,' . $id,
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'rank' => 'required|string',
            'department' => 'required|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'status' => 'required|string',
            'license_class' => 'nullable|string',
            'evoc_level' => 'nullable|string',
            'assigned_vehicle_id' => 'nullable|string',
            'years_of_service' => 'nullable|integer',
        ]);

        if (!empty($data['assigned_vehicle_id'])) {
            $v = Vehicle::find($data['assigned_vehicle_id']);
            if ($v) {
                $data['assigned_vehicle_reg'] = $v->registration;
            }
        }

        $driver->update($data);

        return redirect()->route('drivers.index')->with('success', 'Officer dossier updated.');
    }

    public function destroy($id)
    {
        $driver = Driver::findOrFail($id);
        $driver->delete();
        return redirect()->route('drivers.index')->with('success', 'Officer record archived.');
    }

    public function exportCsv()
    {
        $drivers = Driver::all();
        $csvFileName = 'imo-police-drivers-roster-' . date('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$csvFileName\"",
        ];

        $handle = fopen('php://output', 'w');
        fputcsv($handle, ['ID', 'Badge', 'Full Name', 'Rank', 'Department', 'Phone', 'Email', 'Status', 'EVOC Level', 'Assigned Vehicle', 'Years of Service']);

        $callback = function () use ($drivers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Badge', 'Full Name', 'Rank', 'Department', 'Phone', 'Email', 'Status', 'EVOC Level', 'Assigned Vehicle', 'Years of Service']);
            foreach ($drivers as $d) {
                fputcsv($file, [
                    $d->id,
                    $d->badge_number,
                    $d->full_name,
                    $d->rank,
                    $d->department,
                    $d->phone,
                    $d->email,
                    $d->status,
                    $d->evoc_level,
                    $d->assigned_vehicle_reg ?? 'None',
                    $d->years_of_service
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

