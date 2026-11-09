<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\FuelLog;
use App\Models\Maintenance;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index()
    {
        $totalVehicles = Vehicle::count();
        $totalTrips = Trip::count();
        $totalFuelCost = FuelLog::sum('cost');
        $totalMntCost = Maintenance::sum('cost');
        $totalDistance = Trip::sum('distance_km');

        $vehiclesByDept = Vehicle::selectRaw('department, count(*) as count')
            ->groupBy('department')
            ->pluck('count', 'department');

        $tripsByStatus = Trip::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return view('reports.index', compact(
            'totalVehicles',
            'totalTrips',
            'totalFuelCost',
            'totalMntCost',
            'totalDistance',
            'vehiclesByDept',
            'tripsByStatus'
        ));
    }

    public function exportCsv()
    {
        $trips = Trip::all();
        $csvFileName = 'imo-police-operational-report-' . date('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$csvFileName\"",
        ];

        $callback = function () use ($trips) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Trip ID', 'Vehicle', 'Driver', 'Origin', 'Destination', 'Date', 'Status', 'Distance (km)']);
            foreach ($trips as $t) {
                fputcsv($file, [$t->id, $t->vehicle_reg, $t->driver_name, $t->origin, $t->destination, $t->departure_date, $t->status, $t->distance_km]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

