<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FuelLog extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'vehicle_id',
        'vehicle_reg',
        'litres',
        'cost',
        'price_per_litre',
        'date',
        'mileage',
        'station',
        'fuel_type',
        'officer',
    ];

    protected function casts(): array
    {
        return [
            'litres' => 'decimal:2',
            'cost' => 'decimal:2',
            'price_per_litre' => 'decimal:2',
            'date' => 'date',
            'mileage' => 'integer',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id', 'id');
    }
}

