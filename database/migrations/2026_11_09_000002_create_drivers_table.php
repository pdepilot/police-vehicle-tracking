<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. DRV-01
            $table->string('badge_number')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('rank')->default('Officer');
            $table->string('department')->default('Patrol Division');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('status')->default('On Duty'); // On Duty, Off Duty, On Leave
            $table->string('license_class')->nullable();
            $table->string('evoc_level')->nullable();
            $table->json('certifications')->nullable();
            $table->string('assigned_vehicle_id')->nullable();
            $table->string('assigned_vehicle_reg')->nullable();
            $table->integer('years_of_service')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};

