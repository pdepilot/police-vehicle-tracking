<?php

namespace App\Http\Controllers;

use App\Models\FuelLog;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class FuelController extends Controller
{
    public function index(Request $request)
    {
        $query = FuelLog::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('id', 'like', "%{$s}%")
                    ->orWhere('vehicle_reg', 'like', "%{$s}%")
                    ->orWhere('station', 'like', "%{$s}%")
                    ->orWhere('officer', 'like', "%{$s}%");
            });
        }

        $logs = $query->orderBy('date', 'desc')->get();
        $vehicles = Vehicle::all();

        $totalLitres = FuelLog::sum('litres');
        $totalCost = FuelLog::sum('cost');
        $avgCostPerLitre = $totalLitres > 0 ? ($totalCost / $totalLitres) : 0;

        return view('fuel.index', compact('logs', 'vehicles', 'totalLitres', 'totalCost', 'avgCostPerLitre'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicle_id' => 'required|string',
            'litres' => 'required|numeric',
            'price_per_litre' => 'required|numeric',
            'date' => 'required|date',
            'mileage' => 'required|integer',
            'station' => 'required|string',
            'fuel_type' => 'required|string',
            'officer' => 'required|string',
        ]);

        $vehicle = Vehicle::findOrFail($data['vehicle_id']);
        $data['id'] = 'FUL-' . rand(510, 599);
        $data['vehicle_reg'] = $vehicle->registration;
        $data['cost'] = round($data['litres'] * $data['price_per_litre'], 2);

        FuelLog::create($data);

        $vehicle->fuel_level = 100;
        if ($data['mileage'] > $vehicle->mileage) {
            $vehicle->mileage = $data['mileage'];
        }
        $vehicle->save();

        return redirect()->route('fuel.index')->with('success', 'Fuel slip logged successfully.');
    }

    public function destroy($id)
    {
        $fuel = FuelLog::findOrFail($id);
        $fuel->delete();
        return redirect()->route('fuel.index')->with('success', 'Fuel slip removed.');
    }
}

