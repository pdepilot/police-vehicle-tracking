@extends('layouts.app')

@section('title', 'Reports & Operational Intelligence - Nigeria Police Force Imo State Command')
@section('header_title', 'Operational Intelligence & Executive Reports')
@section('header_subtitle', 'Reports & Analytics')

@section('content')
<!-- REPORTS ACTIONS TOOLBAR -->
<div class="quick-actions-bar">
  <div class="quick-actions-title">
    <i class="fa-solid fa-chart-line text-blue-600" style="color: var(--primary);"></i>
    <span>Fleet Operational Summary & Performance Indicators</span>
  </div>
  <div class="quick-action-buttons">
    <button class="btn btn-secondary btn-sm" id="btn-print-report" onclick="window.print()">
      <i class="fa-solid fa-print"></i> Print Executive Brief
    </button>
    <button class="btn btn-primary btn-sm" id="btn-export-report-csv">
      <i class="fa-solid fa-download"></i> Export Analytics CSV
    </button>
  </div>
</div>

<!-- 4 SUMMARY METRIC CARDS -->
<section class="stats-grid">
  <div class="stat-card success">
    <div class="stat-card-header">
      <span class="stat-label">Fleet Readiness Rate</span>
      <div class="stat-icon success"><i class="fa-solid fa-heart-pulse"></i></div>
    </div>
    <div class="stat-value" id="rep-kpi-readiness">0%</div>
    <div class="stat-footer">
      <span class="stat-trend positive">Above 85% Target</span>
      <span>Available</span>
    </div>
  </div>

  <div class="stat-card primary">
    <div class="stat-card-header">
      <span class="stat-label">Missions Completed</span>
      <div class="stat-icon primary"><i class="fa-solid fa-route"></i></div>
    </div>
    <div class="stat-value" id="rep-kpi-trips">{{ $totalTrips }}</div>
    <div class="stat-footer">
      <span class="stat-trend positive">98.4% Success Rate</span>
      <span>Zero Aborts</span>
    </div>
  </div>

  <div class="stat-card info">
    <div class="stat-card-header">
      <span class="stat-label">Total Patrol Mileage</span>
      <div class="stat-icon info"><i class="fa-solid fa-road"></i></div>
    </div>
    <div class="stat-value" id="rep-kpi-distance">{{ number_format($totalDistance, 0) }} km</div>
    <div class="stat-footer">
      <span class="stat-trend neutral">GPS Logged Range</span>
      <span>State Command Area</span>
    </div>
  </div>

  <div class="stat-card warning">
    <div class="stat-card-header">
      <span class="stat-label">Total Fleet OPEX</span>
      <div class="stat-icon warning"><i class="fa-solid fa-coins"></i></div>
    </div>
    <div class="stat-value" id="rep-kpi-total-opex">₦{{ number_format($totalFuelCost + $totalMntCost, 2) }}</div>
    <div class="stat-footer">
      <span class="stat-trend neutral">Fuel + Maintenance</span>
      <span>Quarter-to-Date</span>
    </div>
  </div>
</section>

<!-- 4 CHARTS GRID -->
<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;" class="grid-analytics-container">
  <!-- Monthly Trip Volume -->
  <div class="content-card">
    <div class="card-header">
      <div class="card-title-group">
        <h2 class="card-title"><i class="fa-solid fa-chart-column text-blue-600"></i> Monthly Mission & Call Volume</h2>
        <span class="card-subtitle">Patrol missions vs Emergency Priority 1 responses</span>
      </div>
    </div>
    <div class="card-body" style="height: 280px; position: relative;">
      <canvas id="report-trips-bar-chart"></canvas>
    </div>
  </div>

  <!-- Vehicle Distribution by Department -->
  <div class="content-card">
    <div class="card-header">
      <div class="card-title-group">
        <h2 class="card-title"><i class="fa-solid fa-chart-pie" style="color: var(--accent-gold);"></i> Fleet Allocation by Division</h2>
        <span class="card-subtitle">Units deployed per specialized police bureau</span>
      </div>
    </div>
    <div class="card-body" style="height: 280px; position: relative;">
      <canvas id="report-dept-chart"></canvas>
    </div>
  </div>

  <!-- Maintenance vs Fuel OPEX -->
  <div class="content-card">
    <div class="card-header">
      <div class="card-title-group">
        <h2 class="card-title"><i class="fa-solid fa-arrow-trend-up" style="color: var(--warning);"></i> OPEX Cost Comparison (₦)</h2>
        <span class="card-subtitle">Monthly fuel expenditure vs workshop maintenance</span>
      </div>
    </div>
    <div class="card-body" style="height: 280px; position: relative;">
      <canvas id="report-cost-chart"></canvas>
    </div>
  </div>

  <!-- Emergency Response Times -->
  <div class="content-card">
    <div class="card-header">
      <div class="card-title-group">
        <h2 class="card-title"><i class="fa-solid fa-stopwatch text-red-500" style="color: var(--danger);"></i> Priority 1 Emergency Response Times</h2>
        <span class="card-subtitle">Time from dispatch 10-33 to on-scene arrival</span>
      </div>
    </div>
    <div class="card-body" style="height: 280px; position: relative;">
      <canvas id="report-response-time-chart"></canvas>
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script src="{{ asset('js/reports.js') }}"></script>
@endsection

