<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. TRP-4091
            $table->string('vehicle_id');
            $table->string('vehicle_reg');
            $table->string('call_sign')->nullable();
            $table->string('driver_id');
            $table->string('driver_name');
            $table->string('origin');
            $table->string('destination');
            $table->date('departure_date');
            $table->string('departure_time');
            $table->string('expected_arrival')->nullable();
            $table->string('actual_arrival')->nullable();
            $table->string('purpose');
            $table->string('priority')->default('Priority 2 - Routine');
            $table->string('status')->default('Active'); // Active, Scheduled, Completed, Cancelled
            $table->decimal('distance_km', 8, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};

