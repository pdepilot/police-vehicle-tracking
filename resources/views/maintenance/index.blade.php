@extends('layouts.app')

@section('title', 'Fleet Maintenance & Workshop Schedule - Nigeria Police Force Imo State Command')
@section('header_title', 'Fleet Maintenance & Workshop Services')
@section('header_subtitle', 'Maintenance')

@section('content')
<!-- MAINTENANCE KPI CARDS -->
<section class="stats-grid">
  <div class="stat-card warning">
    <div class="stat-card-header">
      <span class="stat-label">In Workshop Service</span>
      <div class="stat-icon warning"><i class="fa-solid fa-wrench"></i></div>
    </div>
    <div class="stat-value" id="mnt-kpi-inprogress">{{ $inProgressCount }}</div>
    <div class="stat-footer">
      <span class="stat-trend negative">Active Repairs</span>
      <span>Bay Occupied</span>
    </div>
  </div>

  <div class="stat-card info">
    <div class="stat-card-header">
      <span class="stat-label">Pending / Scheduled</span>
      <div class="stat-icon info"><i class="fa-solid fa-calendar-day"></i></div>
    </div>
    <div class="stat-value" id="mnt-kpi-pending">{{ $pendingCount }}</div>
    <div class="stat-footer">
      <span class="stat-trend neutral">Awaiting Bay Slot</span>
      <span>Queued</span>
    </div>
  </div>

  <div class="stat-card success">
    <div class="stat-card-header">
      <span class="stat-label">Completed Services</span>
      <div class="stat-icon success"><i class="fa-solid fa-circle-check"></i></div>
    </div>
    <div class="stat-value" id="mnt-kpi-completed">{{ $completedCount }}</div>
    <div class="stat-footer">
      <span class="stat-trend positive">Inspected & Cleared</span>
      <span>Ready</span>
    </div>
  </div>

  <div class="stat-card primary">
    <div class="stat-card-header">
      <span class="stat-label">Total Maintenance Spend</span>
      <div class="stat-icon primary"><i class="fa-solid fa-coins"></i></div>
    </div>
    <div class="stat-value" id="mnt-kpi-totalcost">₦{{ number_format($totalCost, 2) }}</div>
    <div class="stat-footer">
      <span class="stat-trend neutral">Fleet Maintenance Budget</span>
      <span>Workshop OPEX</span>
    </div>
  </div>
</section>

<!-- SEARCH & ACTIONS TOOLBAR -->
<div class="filters-toolbar">
  <div class="search-box">
    <i class="fa-solid fa-magnifying-glass"></i>
    <input type="text" id="mnt-search-input" class="search-input" placeholder="Search service order, vehicle plate, work type, technician..." />
  </div>

  <div class="filter-group">
    <select id="mnt-filter-status" class="filter-select">
      <option value="ALL">All Service Statuses</option>
      <option value="In Progress">In Progress (Bay Occupied)</option>
      <option value="Pending">Pending Booking</option>
      <option value="Completed">Completed Services</option>
    </select>

    <button class="btn btn-secondary btn-sm" id="btn-export-maintenance-csv" title="Export Service Logs to CSV">
      <i class="fa-solid fa-file-csv"></i> Export CSV
    </button>

    <button class="btn btn-primary" id="btn-open-add-maintenance">
      <i class="fa-solid fa-plus-circle"></i> Book Service / Repair
    </button>
  </div>
</div>

<!-- MAINTENANCE LOGS TABLE CARD -->
<div class="content-card">
  <div class="card-header">
    <div class="card-title-group">
      <h2 class="card-title">
        <i class="fa-solid fa-gears text-blue-600"></i> Fleet Maintenance & Inspection Records
      </h2>
      <span class="card-subtitle" id="maintenance-count-badge">Loading service logs...</span>
    </div>
  </div>
  <div class="card-body no-padding">
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Service Order ID</th>
            <th>Vehicle Plate</th>
            <th>Service Type & Description</th>
            <th>Workshop & Technician</th>
            <th>Dates (Reported / Next)</th>
            <th>Cost</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="maintenance-table-tbody">
          <!-- Populated by maintenance.js from MySQL database -->
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- MODAL: ADD / EDIT MAINTENANCE -->
<div class="modal-overlay" id="maintenance-crud-modal">
  <div class="modal-box lg">
    <div class="modal-header">
      <h3 class="modal-title" id="maintenance-modal-title">
        <i class="fa-solid fa-wrench text-blue-600"></i> Book Fleet Service
      </h3>
      <button class="modal-close-btn" onclick="FleetApp.closeModal('maintenance-crud-modal')">&times;</button>
    </div>
    <form id="maintenance-modal-form">
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required" for="form-mnt-vehicle">Police Unit</label>
            <select id="form-mnt-vehicle" class="form-control" required>
              <!-- Dynamically populated -->
            </select>
          </div>

          <div class="form-group">
            <label class="form-label required" for="form-mnt-type">Maintenance / Service Type</label>
            <select id="form-mnt-type" class="form-control" required>
              <option value="10,000-Mile Scheduled Service">10,000-Mile Scheduled Service</option>
              <option value="Brake System & Rotors Overhaul">Brake System & Rotors Overhaul</option>
              <option value="Transmission Flush & Inspection">Transmission Flush & Inspection</option>
              <option value="Emergency Siren & Lightbar Repair">Emergency Siren & Lightbar Repair</option>
              <option value="Ballistic Glass & Armor Inspection">Ballistic Glass & Armor Inspection</option>
              <option value="High-Speed Pursuit Tire Replacement">High-Speed Pursuit Tire Replacement</option>
              <option value="Suspension & Steering Alignment">Suspension & Steering Alignment</option>
              <option value="K-9 Kennel Climate System Repair">K-9 Kennel Climate System Repair</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-mnt-cost">Estimated / Actual Cost (₦)</label>
            <input type="number" id="form-mnt-cost" class="form-control" value="450" min="0" step="10" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-mnt-status">Service Status</label>
            <select id="form-mnt-status" class="form-control">
              <option value="In Progress">In Progress (Bay Occupied)</option>
              <option value="Pending">Pending Service Booking</option>
              <option value="Completed">Completed & Returned to Fleet</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label required" for="form-mnt-reported-date">Date Reported / Booked</label>
            <input type="date" id="form-mnt-reported-date" class="form-control" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-mnt-service-date">Service Date</label>
            <input type="date" id="form-mnt-service-date" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-mnt-next-date">Next Scheduled Service Due</label>
            <input type="date" id="form-mnt-next-date" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-mnt-provider">Repair Facility / Service Center</label>
            <input type="text" id="form-mnt-provider" class="form-control" value="State Police Command Central Workshop Bay 2" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-mnt-tech">Assigned Master Technician</label>
            <input type="text" id="form-mnt-tech" class="form-control" value="Master Tech J. Kowalski" />
          </div>

          <div class="form-group full-width">
            <label class="form-label" for="form-mnt-desc">Detailed Work Order Description</label>
            <textarea id="form-mnt-desc" class="form-control" rows="2" placeholder="Describe symptoms, replaced OEM parts, telemetry diagnostic codes..."></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="FleetApp.closeModal('maintenance-crud-modal')">Cancel</button>
        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Service Order</button>
      </div>
    </form>
  </div>
</div>
@endsection

@section('scripts')
<script src="{{ asset('js/maintenance.js') }}"></script>
@endsection

