<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'vehicle_id',
        'vehicle_reg',
        'call_sign',
        'driver_id',
        'driver_name',
        'origin',
        'destination',
        'departure_date',
        'departure_time',
        'expected_arrival',
        'actual_arrival',
        'purpose',
        'priority',
        'status',
        'distance_km',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'departure_date' => 'date',
            'distance_km' => 'decimal:2',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id', 'id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'driver_id', 'id');
    }
}

