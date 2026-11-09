<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'badge_number',
        'first_name',
        'last_name',
        'rank',
        'department',
        'phone',
        'email',
        'status',
        'license_class',
        'evoc_level',
        'certifications',
        'assigned_vehicle_id',
        'assigned_vehicle_reg',
        'years_of_service',
    ];

    protected function casts(): array
    {
        return [
            'certifications' => 'array',
            'years_of_service' => 'integer',
        ];
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function assignedVehicle()
    {
        return $this->belongsTo(Vehicle::class, 'assigned_vehicle_id', 'id');
    }

    public function trips()
    {
        return $this->hasMany(Trip::class, 'driver_id', 'id');
    }
}

