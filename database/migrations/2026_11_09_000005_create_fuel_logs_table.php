<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fuel_logs', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. FUL-501
            $table->string('vehicle_id');
            $table->string('vehicle_reg');
            $table->decimal('litres', 8, 2);
            $table->decimal('cost', 10, 2);
            $table->decimal('price_per_litre', 8, 2);
            $table->date('date');
            $table->integer('mileage');
            $table->string('station')->nullable();
            $table->string('fuel_type')->nullable();
            $table->string('officer')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fuel_logs');
    }
};

