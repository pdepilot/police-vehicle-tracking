@extends('layouts.app')

@section('title', 'Fuel Expenditure & Fleet Efficiency - Nigeria Police Force Imo State Command')
@section('header_title', 'Fuel Management & Tank Logs')
@section('header_subtitle', 'Fuel Management')

@section('content')
<!-- FUEL KPI CARDS -->
<section class="stats-grid">
  <div class="stat-card primary">
    <div class="stat-card-header">
      <span class="stat-label">Total Dispensed</span>
      <div class="stat-icon primary"><i class="fa-solid fa-gas-pump"></i></div>
    </div>
    <div class="stat-value" id="fuel-kpi-litres">{{ number_format($totalLitres, 1) }} L</div>
    <div class="stat-footer">
      <span class="stat-trend neutral">Fleet Consumed</span>
      <span>All Depots</span>
    </div>
  </div>

  <div class="stat-card warning">
    <div class="stat-card-header">
      <span class="stat-label">Total Fuel Expenditure</span>
      <div class="stat-icon warning"><i class="fa-solid fa-receipt"></i></div>
    </div>
    <div class="stat-value" id="fuel-kpi-cost">₦{{ number_format($totalCost, 2) }}</div>
    <div class="stat-footer">
      <span class="stat-trend neutral">Monthly Fuel Bill</span>
      <span>Command Fuel Account</span>
    </div>
  </div>

  <div class="stat-card success">
    <div class="stat-card-header">
      <span class="stat-label">Avg Fuel Price</span>
      <div class="stat-icon success"><i class="fa-solid fa-chart-line"></i></div>
    </div>
    <div class="stat-value" id="fuel-kpi-avgprice">₦{{ number_format($avgCostPerLitre, 2) }} / L</div>
    <div class="stat-footer">
      <span class="stat-trend positive">Bulk Rate</span>
      <span>Subsidized</span>
    </div>
  </div>

  <div class="stat-card info">
    <div class="stat-card-header">
      <span class="stat-label">Refueling Slips</span>
      <div class="stat-icon info"><i class="fa-solid fa-file-invoice"></i></div>
    </div>
    <div class="stat-value" id="fuel-kpi-entries">{{ count($logs) }}</div>
    <div class="stat-footer">
      <span class="stat-trend positive">Verified Pump Logs</span>
      <span>Logged</span>
    </div>
  </div>
</section>

<!-- FUEL CONSUMPTION CHART -->
<div class="content-card">
  <div class="card-header">
    <div class="card-title-group">
      <h2 class="card-title">
        <i class="fa-solid fa-chart-simple text-blue-600"></i> Fuel Dispensed by Patrol Unit (Litres)
      </h2>
      <span class="card-subtitle">Volume breakdown by vehicle registration</span>
    </div>
  </div>
  <div class="card-body" style="height: 260px; position: relative;">
    <canvas id="fuel-trends-chart"></canvas>
  </div>
</div>

<!-- SEARCH & ACTIONS TOOLBAR -->
<div class="filters-toolbar">
  <div class="search-box">
    <i class="fa-solid fa-magnifying-glass"></i>
    <input type="text" id="fuel-search-input" class="search-input" placeholder="Search vehicle plate, station depot, fuel type, officer..." />
  </div>

  <div class="filter-group">
    <button class="btn btn-secondary btn-sm" id="btn-export-fuel-csv" title="Export Fuel Log to CSV">
      <i class="fa-solid fa-file-csv"></i> Export CSV
    </button>

    <button class="btn btn-primary" id="btn-open-add-fuel">
      <i class="fa-solid fa-plus-circle"></i> Log Fuel Entry
    </button>
  </div>
</div>

<!-- FUEL LOGS TABLE -->
<div class="content-card">
  <div class="card-header">
    <div class="card-title-group">
      <h2 class="card-title">
        <i class="fa-solid fa-gas-pump text-blue-600"></i> Refueling Slips & Consumption Archive
      </h2>
      <span class="card-subtitle" id="fuel-count-badge">Loading slips...</span>
    </div>
  </div>
  <div class="card-body no-padding">
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Slip ID</th>
            <th>Vehicle</th>
            <th>Station / Pump</th>
            <th>Officer</th>
            <th>Volume (L)</th>
            <th>Total Cost</th>
            <th>Date & Odometer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="fuel-table-tbody">
          <!-- Rendered dynamically by fuel.js from MySQL database -->
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- MODAL: LOG FUEL ENTRY -->
<div class="modal-overlay" id="fuel-crud-modal">
  <div class="modal-box">
    <div class="modal-header">
      <h3 class="modal-title">
        <i class="fa-solid fa-gas-pump text-blue-600"></i> Log Vehicle Refueling Slip
      </h3>
      <button class="modal-close-btn" onclick="FleetApp.closeModal('fuel-crud-modal')">&times;</button>
    </div>
    <form id="fuel-modal-form">
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-group full-width">
            <label class="form-label required" for="form-fuel-vehicle">Police Unit</label>
            <select id="form-fuel-vehicle" class="form-control" required>
              <!-- Populated dynamically -->
            </select>
          </div>

          <div class="form-group">
            <label class="form-label required" for="form-fuel-litres">Quantity Dispensed (Litres)</label>
            <input type="number" id="form-fuel-litres" class="form-control" required value="60" min="1" max="500" step="0.5" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-fuel-price">Price Per Litre (₦)</label>
            <input type="number" id="form-fuel-price" class="form-control" value="1.85" step="0.01" />
          </div>

          <div class="form-group">
            <label class="form-label required" for="form-fuel-cost">Total Invoice Cost (₦)</label>
            <input type="number" id="form-fuel-cost" class="form-control" required value="111.00" step="0.01" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-fuel-type">Fuel Grade</label>
            <select id="form-fuel-type" class="form-control">
              <option value="Premium Unleaded 93">Premium Unleaded 93 (Pursuit Spec)</option>
              <option value="Regular Unleaded 89">Regular Unleaded 89</option>
              <option value="Ultra-Low Sulfur Diesel">Ultra-Low Sulfur Diesel (Heavy Unit)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label required" for="form-fuel-date">Refueling Date</label>
            <input type="date" id="form-fuel-date" class="form-control" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-fuel-mileage">Odometer Reading (km)</label>
            <input type="number" id="form-fuel-mileage" class="form-control" value="25000" />
          </div>

          <div class="form-group full-width">
            <label class="form-label" for="form-fuel-station">Fuel Station / Depot Pump</label>
            <input type="text" id="form-fuel-station" class="form-control" value="Command Fleet Fuel Depot — Pump 2" />
          </div>

          <div class="form-group full-width">
            <label class="form-label" for="form-fuel-officer">Authorizing Officer</label>
            <input type="text" id="form-fuel-officer" class="form-control" value="Duty Officer" />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="FleetApp.closeModal('fuel-crud-modal')">Cancel</button>
        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> Log Refueling Entry</button>
      </div>
    </form>
  </div>
</div>
@endsection

@section('scripts')
<script src="{{ asset('js/fuel.js') }}"></script>
@endsection

