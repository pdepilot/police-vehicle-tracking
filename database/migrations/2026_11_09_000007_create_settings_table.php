<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('commander_name')->default('CP Imo State Command');
            $table->string('commander_badge')->default('NPF-IMO-001');
            $table->string('commander_email')->default('imo.commander@police.gov.ng');
            $table->string('department')->default('Nigeria Police Force — Imo State Command');
            $table->string('terminal_id')->default('NPF-IMO-HQ-TERM-01');
            $table->string('theme')->default('light');
            $table->string('speed_unit')->default('KMH');
            $table->integer('telemetry_refresh_rate')->default(5);
            $table->boolean('audio_alerts')->default(true);
            $table->boolean('auto_assign_tracking')->default(true);
            $table->string('last_backup')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};

