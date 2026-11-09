<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenances', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. MNT-301
            $table->string('vehicle_id');
            $table->string('vehicle_reg');
            $table->string('vehicle_model')->nullable();
            $table->string('type');
            $table->text('description')->nullable();
            $table->decimal('cost', 10, 2)->default(0);
            $table->date('reported_date');
            $table->date('service_date')->nullable();
            $table->date('next_service_date')->nullable();
            $table->string('provider')->nullable();
            $table->string('status')->default('Pending'); // Pending, In Progress, Completed
            $table->string('technician')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenances');
    }
};

