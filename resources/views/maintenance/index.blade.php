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
      <span class="card-subtitle" id="maintenance-count-badge">{{ isset($records) ? count($records) : 0 }} service records</span>
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
          @if(isset($records) && count($records) > 0)
            @foreach($records as $m)
              @php
                $statusClass = 'status-available';
                if ($m->status === 'In Progress') $statusClass = 'status-maintenance';
                elseif ($m->status === 'Pending') $statusClass = 'status-ontrip';
              @endphp
              <tr>
                <td>
                  <span style="font-family: var(--font-mono); font-weight: 700; color: var(--navy);">{{ $m->id }}</span>
                </td>
                <td>
                  <span class="plate-badge"><i class="fa-solid fa-shield"></i> {{ $m->vehicle_reg }}</span>
                  <div style="font-size: 0.72rem; color: var(--muted); margin-top: 2px;">{{ $m->vehicle_model ?? 'Fleet Unit' }}</div>
                </td>
                <td>
                  <div style="font-weight: 600; color: var(--navy);">{{ $m->type }}</div>
                  <div style="font-size: 0.72rem; color: var(--muted); max-width: 260px;">{{ $m->description }}</div>
                </td>
                <td>
                  <div style="font-size: 0.76rem;">{{ $m->provider ?? 'Command Central Workshop' }}</div>
                  <div style="font-size: 0.7rem; color: var(--muted);"><i class="fa-solid fa-user-gear"></i> {{ $m->technician ?? 'Assigned Tech' }}</div>
                </td>
                <td>
                  <div style="font-family: var(--font-mono); font-size: 0.75rem;">
                    <div>Logged: {{ $m->reported_date }}</div>
                    <div style="color: var(--gold-dark);">Next: {{ $m->next_service_date ?? 'TBD' }}</div>
                  </div>
                </td>
                <td>
                  <span style="font-family: var(--font-mono); font-weight: 700; color: var(--navy);">₦{{ number_format($m->cost, 2) }}</span>
                </td>
                <td>
                  <span class="status-pill {{ $statusClass }}">
                    <span class="dot"></span> {{ $m->status }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="action-btn-sm" onclick="MaintenancePage.editMaintenance('{{ $m->id }}')" title="Edit Service Record">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-btn-sm delete" onclick="MaintenancePage.deleteMaintenance('{{ $m->id }}')" title="Delete Record">
                      <i class="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            @endforeach
          @else
            <tr>
              <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--muted);">
                <i class="fa-solid fa-screwdriver-wrench" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.4;"></i>
                No maintenance records match your active criteria.
              </td>
            </tr>
          @endif
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
    <form id="maintenance-modal-form" action="{{ route('maintenance.store') }}" method="POST">
      @csrf
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required" for="form-mnt-vehicle">Police Unit</label>
            <select id="form-mnt-vehicle" name="vehicle_id" class="form-control" required>
              <option value="">-- Select Police Unit --</option>
              @if(isset($vehicles))
                @foreach($vehicles as $veh)
                  <option value="{{ $veh->id }}">{{ $veh->registration }} — {{ $veh->call_sign }} ({{ $veh->make }} {{ $veh->model }})</option>
                @endforeach
              @endif
            </select>
          </div>

          <div class="form-group">
            <label class="form-label required" for="form-mnt-type">Maintenance / Service Type</label>
            <select id="form-mnt-type" name="type" class="form-control" required>
              <option value="15,000-km Scheduled Service">15,000-km Scheduled Service</option>
              <option value="Brake System & Rotors Overhaul">Brake System & Rotors Overhaul</option>
              <option value="Engine & Transmission Diagnostics">Engine & Transmission Diagnostics</option>
              <option value="Emergency Siren & Lightbar Repair">Emergency Siren & Lightbar Repair</option>
              <option value="Ballistic Glass & Armor Inspection">Ballistic Glass & Armor Inspection</option>
              <option value="Tactical Pursuit Tire Replacement">Tactical Pursuit Tire Replacement</option>
              <option value="Suspension & Steering Alignment">Suspension & Steering Alignment</option>
              <option value="K-9 Tactical Kennel Servicing">K-9 Tactical Kennel Servicing</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-mnt-cost">Estimated / Actual Cost (₦)</label>
            <input type="number" id="form-mnt-cost" name="cost" class="form-control" placeholder="e.g. 150000" min="0" step="500" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-mnt-status">Service Status</label>
            <select id="form-mnt-status" name="status" class="form-control">
              <option value="In Progress">In Progress (Bay Occupied)</option>
              <option value="Pending">Pending Service Booking</option>
              <option value="Completed">Completed & Returned to Fleet</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label required" for="form-mnt-reported-date">Date Reported / Booked</label>
            <input type="date" id="form-mnt-reported-date" name="reported_date" class="form-control" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-mnt-service-date">Service Date</label>
            <input type="date" id="form-mnt-service-date" name="service_date" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-mnt-next-date">Next Scheduled Service Due</label>
            <input type="date" id="form-mnt-next-date" name="next_service_date" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-mnt-provider">Repair Facility / Service Center</label>
            <input type="text" id="form-mnt-provider" name="provider" class="form-control" placeholder="e.g. Command Central Workshop Bay 2" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-mnt-tech">Assigned Master Technician</label>
            <input type="text" id="form-mnt-tech" name="technician" class="form-control" placeholder="e.g. Master Tech Ibrahim Usman" />
          </div>

          <div class="form-group full-width">
            <label class="form-label" for="form-mnt-desc">Detailed Work Order Description</label>
            <textarea id="form-mnt-desc" name="description" class="form-control" rows="2" placeholder="Describe symptoms, replaced OEM parts, telemetry diagnostic codes..."></textarea>
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

