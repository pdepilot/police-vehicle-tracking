<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'vehicle_id',
        'vehicle_reg',
        'vehicle_model',
        'type',
        'description',
        'cost',
        'reported_date',
        'service_date',
        'next_service_date',
        'provider',
        'status',
        'technician',
    ];

    protected function casts(): array
    {
        return [
            'cost' => 'decimal:2',
            'reported_date' => 'date',
            'service_date' => 'date',
            'next_service_date' => 'date',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id', 'id');
    }
}

