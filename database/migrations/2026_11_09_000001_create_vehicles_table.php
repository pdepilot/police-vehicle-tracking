<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. VEH-101
            $table->string('registration')->unique(); // e.g. POL-2041
            $table->string('call_sign')->nullable(); // e.g. Alpha-01
            $table->string('vin')->nullable();
            $table->string('make');
            $table->string('model');
            $table->integer('year')->nullable();
            $table->string('type')->default('SUV'); // SUV, Sedan, Truck, etc.
            $table->string('department')->default('Patrol Division');
            $table->string('assigned_driver_id')->nullable();
            $table->string('assigned_driver_name')->nullable();
            $table->string('status')->default('Available'); // Available, On Trip, Maintenance, Decommissioned
            $table->integer('mileage')->default(0);
            $table->integer('fuel_level')->default(100);
            $table->decimal('fuel_capacity', 8, 2)->default(70.00);
            $table->integer('battery_level')->default(100);
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->integer('speed')->default(0);
            $table->string('heading')->default('N');
            $table->boolean('siren_active')->default(false);
            $table->date('last_service_date')->nullable();
            $table->date('next_service_date')->nullable();
            $table->string('last_location')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};

