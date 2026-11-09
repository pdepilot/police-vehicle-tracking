@extends('layouts.app')

@section('title', 'Trip Assignments & Dispatches - Nigeria Police Force Imo State Command')
@section('header_title', 'Trip Assignments & Dispatch Orders')
@section('header_subtitle', 'Dispatches')

@section('content')
<!-- DISPATCH ASSIGNMENT FORM CARD -->
<div class="content-card">
  <div class="card-header">
    <div class="card-title-group">
      <h2 class="card-title">
        <i class="fa-solid fa-clipboard-list text-blue-600"></i> New Operational Dispatch Order
      </h2>
      <span class="card-subtitle">Authorize vehicle deployment & assign qualified police personnel</span>
    </div>
  </div>
  <div class="card-body">
    <form id="trip-dispatch-form">
      <div class="form-grid">
        <!-- Auto-Generated Trip ID -->
        <div class="form-group">
          <label class="form-label" for="dispatch-trip-id">Trip Dispatch Identifier (Auto-Generated)</label>
          <input type="text" id="dispatch-trip-id" class="form-control" readonly style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);" />
        </div>

        <!-- Priority Level -->
        <div class="form-group">
          <label class="form-label required" for="dispatch-priority">Mission Priority Tier</label>
          <select id="dispatch-priority" class="form-control" required>
            <option value="Priority 2 - Routine Operational">Priority 2 - Routine Operational Patrol</option>
            <option value="Priority 1 - High Visibility">Priority 1 - High Visibility / Crime Prevention</option>
            <option value="Priority 1 - Emergency Tactical">Priority 1 - Emergency Tactical Response</option>
            <option value="Priority 2 - Security Custody">Priority 2 - Security Detainee Custody</option>
            <option value="Priority 1 - VIP Security">Priority 1 - Dignitary VIP Escort</option>
          </select>
        </div>

        <!-- Vehicle Selection -->
        <div class="form-group">
          <label class="form-label required" for="dispatch-vehicle-select">Deployment Vehicle (Available Only)</label>
          <select id="dispatch-vehicle-select" class="form-control" required>
            <!-- Populated dynamically from MySQL database -->
          </select>
          <span class="form-helper"><i class="fa-solid fa-circle-info"></i> Units in maintenance or on active trips cannot be selected.</span>
        </div>

        <!-- Driver Selection -->
        <div class="form-group">
          <label class="form-label required" for="dispatch-driver-select">Assigned Officer / Driver</label>
          <select id="dispatch-driver-select" class="form-control" required>
            <!-- Populated dynamically -->
          </select>
          <span class="form-helper"><i class="fa-solid fa-circle-info"></i> Only verified on-duty officers are available for assignment.</span>
        </div>

        <!-- Starting Location -->
        <div class="form-group">
          <label class="form-label required" for="dispatch-origin">Starting Location / Staging Post</label>
          <input type="text" id="dispatch-origin" class="form-control" required value="Command Headquarters, Owerri" placeholder="e.g. Command Headquarters Bay 4" />
        </div>

        <!-- Destination -->
        <div class="form-group">
          <label class="form-label required" for="dispatch-destination">Destination / Patrol Sector</label>
          <input type="text" id="dispatch-destination" class="form-control" required placeholder="e.g. Wetheral Road Commercial Axis, Expressway Corridor" />
        </div>

        <!-- Departure Date & Time -->
        <div class="form-group">
          <label class="form-label required" for="dispatch-dep-date">Departure Date</label>
          <input type="date" id="dispatch-dep-date" class="form-control" required />
        </div>

        <div class="form-group">
          <label class="form-label required" for="dispatch-dep-time">Departure Time</label>
          <input type="time" id="dispatch-dep-time" class="form-control" required />
        </div>

        <!-- Expected Arrival -->
        <div class="form-group">
          <label class="form-label required" for="dispatch-exp-arrival">Expected Arrival / Return Time</label>
          <input type="time" id="dispatch-exp-arrival" class="form-control" required />
        </div>

        <!-- Operational Purpose -->
        <div class="form-group">
          <label class="form-label required" for="dispatch-purpose">Journey / Mission Purpose</label>
          <input type="text" id="dispatch-purpose" class="form-control" required placeholder="e.g. High-Speed Intercept Patrol, VIP Escort, Crime Scene Sweep" />
        </div>

        <!-- Additional Notes -->
        <div class="form-group full-width">
          <label class="form-label" for="dispatch-notes">Special Dispatch Directives & Notes</label>
          <textarea id="dispatch-notes" class="form-control" rows="2" placeholder="Specific dispatch parameters, radio channel assignments, backup rendezvous..."></textarea>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; border-top: 1px solid var(--border-light); padding-top: 1.25rem;">
        <button type="button" class="btn btn-secondary" id="btn-reset-dispatch-form">Reset Form</button>
        <button type="submit" class="btn btn-primary btn-lg">
          <i class="fa-solid fa-paper-plane"></i> Authorize & Dispatch Mission
        </button>
      </div>
    </form>
  </div>
</div>

<!-- ACTIVE DISPATCHES TABLE -->
<div class="content-card">
  <div class="card-header">
    <div class="card-title-group">
      <h2 class="card-title">
        <i class="fa-solid fa-tower-broadcast text-blue-600"></i> Active & Scheduled Dispatches
      </h2>
      <span class="card-subtitle" id="active-dispatches-count">Loading active units...</span>
    </div>
    <div class="card-actions">
      <a href="{{ route('trips.history') }}" class="btn btn-secondary btn-sm">
        View Archived Logs <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </div>
  <div class="card-body no-padding">
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Trip ID & Priority</th>
            <th>Vehicle</th>
            <th>Officer</th>
            <th>Destination & Purpose</th>
            <th>Schedule</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="active-trips-tbody">
          <!-- Rendered dynamically via trips.js from MySQL database -->
        </tbody>
      </table>
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script src="{{ asset('js/trips.js') }}"></script>
@endsection

