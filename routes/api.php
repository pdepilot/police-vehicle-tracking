<?php

use App\Http\Controllers\FleetApiController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->prefix('fleet')->group(function () {
    Route::get('/all', [FleetApiController::class, 'all']);

    // Vehicles
    Route::get('/vehicles', [FleetApiController::class, 'getVehicles']);
    Route::post('/vehicles', [FleetApiController::class, 'storeVehicle']);
    Route::put('/vehicles/{id}', [FleetApiController::class, 'updateVehicle']);
    Route::delete('/vehicles/{id}', [FleetApiController::class, 'deleteVehicle']);
    Route::post('/vehicles/{id}/siren', [FleetApiController::class, 'toggleSiren']);
    Route::post('/vehicles/{id}/telemetry', [FleetApiController::class, 'updateTelemetry']);

    // Drivers
    Route::get('/drivers', [FleetApiController::class, 'getDrivers']);
    Route::post('/drivers', [FleetApiController::class, 'storeDriver']);
    Route::put('/drivers/{id}', [FleetApiController::class, 'updateDriver']);
    Route::delete('/drivers/{id}', [FleetApiController::class, 'deleteDriver']);

    // Trips
    Route::get('/trips', [FleetApiController::class, 'getTrips']);
    Route::post('/trips', [FleetApiController::class, 'storeTrip']);
    Route::put('/trips/{id}', [FleetApiController::class, 'updateTrip']);
    Route::delete('/trips/{id}', [FleetApiController::class, 'deleteTrip']);

    // Maintenance
    Route::get('/maintenance', [FleetApiController::class, 'getMaintenance']);
    Route::post('/maintenance', [FleetApiController::class, 'storeMaintenance']);
    Route::put('/maintenance/{id}', [FleetApiController::class, 'updateMaintenance']);
    Route::delete('/maintenance/{id}', [FleetApiController::class, 'deleteMaintenance']);

    // Fuel
    Route::get('/fuel', [FleetApiController::class, 'getFuel']);
    Route::post('/fuel', [FleetApiController::class, 'storeFuel']);
    Route::delete('/fuel/{id}', [FleetApiController::class, 'deleteFuel']);

    // Notifications
    Route::get('/notifications', [FleetApiController::class, 'getNotifications']);
    Route::post('/notifications', [FleetApiController::class, 'testNotification']);
    Route::post('/notifications/{id}/read', [FleetApiController::class, 'markNotificationRead']);
    Route::post('/notifications/read-all', [FleetApiController::class, 'markAllNotificationsRead']);
    Route::delete('/notifications/{id}', [FleetApiController::class, 'deleteNotification']);
    Route::post('/notifications/test', [FleetApiController::class, 'testNotification']);

    // Settings
    Route::get('/settings', [FleetApiController::class, 'getSettings']);
    Route::post('/settings', [FleetApiController::class, 'saveSettings']);

    // Disabled for security
    // Route::post('/reset', [FleetApiController::class, 'resetDatabase']);
    // Route::get('/backup', [FleetApiController::class, 'backupDatabase']);
});

