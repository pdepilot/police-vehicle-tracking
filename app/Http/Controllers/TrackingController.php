<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::all();
        return view('tracking.index', compact('vehicles'));
    }
}

