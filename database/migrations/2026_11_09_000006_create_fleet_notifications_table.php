<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fleet_notifications', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. NOTIF-101
            $table->string('title');
            $table->text('message');
            $table->string('type')->default('alert'); // alert, assignment, maintenance, completed, update
            $table->string('timestamp')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fleet_notifications');
    }
};

