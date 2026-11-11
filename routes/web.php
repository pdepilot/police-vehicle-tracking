<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\FuelController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;

// Authentication routes
Route::get('/', [AuthController::class, 'showLogin'])->name('login');
Route::get('/login', [AuthController::class, 'showLogin']);
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:login')
    ->name('login.post');
Route::get('/index.html', fn() => redirect()->route('login'));

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Fleet Command Web Pages
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Vehicles
    Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
    Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicles.store');
    Route::put('/vehicles/{id}', [VehicleController::class, 'update'])->name('vehicles.update');
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy'])->name('vehicles.destroy');

    // Drivers
    Route::get('/drivers', [DriverController::class, 'index'])->name('drivers.index');
    Route::post('/drivers', [DriverController::class, 'store'])->name('drivers.store');
    Route::put('/drivers/{id}', [DriverController::class, 'update'])->name('drivers.update');
    Route::delete('/drivers/{id}', [DriverController::class, 'destroy'])->name('drivers.destroy');
    Route::get('/drivers-export', [DriverController::class, 'exportCsv'])->name('drivers.export');

    // Tracking
    Route::get('/tracking', [TrackingController::class, 'index'])->name('tracking.index');

    // Trips
    Route::get('/trips', [TripController::class, 'index'])->name('trips.index');
    Route::post('/trips', [TripController::class, 'store'])->name('trips.store');
    Route::post('/trips/{id}/complete', [TripController::class, 'complete'])->name('trips.complete');
    Route::post('/trips/{id}/cancel', [TripController::class, 'cancel'])->name('trips.cancel');
    Route::get('/trip-history', [TripController::class, 'history'])->name('trips.history');
    Route::get('/trips-export', [TripController::class, 'exportCsv'])->name('trips.export');

    // Maintenance
    Route::get('/maintenance', [MaintenanceController::class, 'index'])->name('maintenance.index');
    Route::post('/maintenance', [MaintenanceController::class, 'store'])->name('maintenance.store');
    Route::post('/maintenance/{id}/status', [MaintenanceController::class, 'updateStatus'])->name('maintenance.status');
    Route::delete('/maintenance/{id}', [MaintenanceController::class, 'destroy'])->name('maintenance.destroy');

    // Fuel
    Route::get('/fuel', [FuelController::class, 'index'])->name('fuel.index');
    Route::post('/fuel', [FuelController::class, 'store'])->name('fuel.store');
    Route::delete('/fuel/{id}', [FuelController::class, 'destroy'])->name('fuel.destroy');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::post('/notifications/test', [NotificationController::class, 'generateTest'])->name('notifications.test');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports-export', [ReportController::class, 'exportCsv'])->name('reports.export');

    // Settings
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
    Route::post('/settings/credentials', [SettingController::class, 'updateCredentials'])->name('settings.credentials.update');

// Legacy HTML Route Aliases & Redirects
    Route::get('/dashboard.html', fn() => redirect()->route('dashboard'));
    Route::get('/vehicles.html', fn() => redirect()->route('vehicles.index'));
    Route::get('/drivers.html', fn() => redirect()->route('drivers.index'));
    Route::get('/tracking.html', fn() => redirect()->route('tracking.index'));
    Route::get('/trips.html', fn() => redirect()->route('trips.index'));
    Route::get('/trip-history.html', fn() => redirect()->route('trips.history'));
    Route::get('/maintenance.html', fn() => redirect()->route('maintenance.index'));
    Route::get('/fuel.html', fn() => redirect()->route('fuel.index'));
    Route::get('/notifications.html', fn() => redirect()->route('notifications.index'));
    Route::get('/reports.html', fn() => redirect()->route('reports.index'));
    Route::get('/settings.html', fn() => redirect()->route('settings.index'));
});
