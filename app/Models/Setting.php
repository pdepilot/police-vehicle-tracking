<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'commander_name',
        'commander_badge',
        'commander_email',
        'department',
        'terminal_id',
        'theme',
        'speed_unit',
        'telemetry_refresh_rate',
        'audio_alerts',
        'auto_assign_tracking',
        'last_backup',
    ];

    protected function casts(): array
    {
        return [
            'telemetry_refresh_rate' => 'integer',
            'audio_alerts' => 'boolean',
            'auto_assign_tracking' => 'boolean',
        ];
    }
}

