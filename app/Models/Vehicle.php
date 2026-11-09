<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'registration',
        'call_sign',
        'vin',
        'make',
        'model',
        'year',
        'type',
        'department',
        'assigned_driver_id',
        'assigned_driver_name',
        'status',
        'mileage',
        'fuel_level',
        'fuel_capacity',
        'battery_level',
        'lat',
        'lng',
        'speed',
        'heading',
        'siren_active',
        'last_service_date',
        'next_service_date',
        'last_location',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'mileage' => 'integer',
            'fuel_level' => 'integer',
            'fuel_capacity' => 'decimal:2',
            'battery_level' => 'integer',
            'lat' => 'float',
            'lng' => 'float',
            'speed' => 'integer',
            'siren_active' => 'boolean',
            'last_service_date' => 'date',
            'next_service_date' => 'date',
        ];
    }

    public function assignedDriver()
    {
        return $this->belongsTo(Driver::class, 'assigned_driver_id', 'id');
    }

    public function trips()
    {
        return $this->hasMany(Trip::class, 'vehicle_id', 'id');
    }

    public function maintenances()
    {
        return $this->hasMany(Maintenance::class, 'vehicle_id', 'id');
    }

    public function fuelLogs()
    {
        return $this->hasMany(FuelLog::class, 'vehicle_id', 'id');
    }
}

