@extends('layouts.app')

@section('title', 'Nigeria Police Force (Imo State Command) - Dashboard & Command Operations')
@section('header_title', 'Operations Dashboard')
@section('header_subtitle', 'Live Fleet Overview')

@section('content')
<!-- VIEW CONTAINER -->
<section class="view active" id="view-dashboard" data-view="dashboard">

  <!-- PAGE HEAD (TravelBooking Layout & Typography) -->
  <div class="page-head">
    <div>
      <h1>Operations Dashboard <span class="live-pill" id="liveFeedPill"><span class="live-dot"></span> Live Telemetry Feed</span></h1>
      <p>Real-time overview of Imo State Command patrol units, emergency dispatches & fleet readiness &bull; Last synchronized: <span id="liveTimestamp" style="font-weight:600;color:var(--navy);">{{ date('g:i:s A') }}</span></p>
    </div>
    <div class="page-head-actions">
      <button type="button" class="btn btn-ghost" id="btnRefreshLive" title="Poll MySQL database now">
        <i class="bi bi-arrow-clockwise" id="refreshIcon"></i> Refresh Data
      </button>
      <a href="{{ route('reports.index') }}" class="btn btn-ghost">
        <i class="bi bi-bar-chart-line"></i> View Reports
      </a>
      <a href="{{ route('tracking.index') }}" class="btn btn-ghost">
        <i class="bi bi-geo-alt"></i> Live Radar
      </a>
      <button type="button" class="btn btn-gold" id="dash-quick-assign-trip">
        <i class="bi bi-plus-lg"></i> Assign Trip
      </button>
    </div>
  </div>

  <!-- LIVE DATABASE CONNECTION ALERT -->
  <div class="info-note">
    <i class="bi bi-shield-check"></i>
    <div>
      <strong>Fleet Management Database Connected.</strong> Vehicle, dispatch, maintenance, and fuel records are managed through the <code>police-car-tracker</code> MySQL database. Live GPS telemetry is not yet connected.
    </div>
  </div>

  <!-- EMERGENCY & QUICK DISPATCH BAR -->
  <div class="quick-dispatch-bar">
    <div class="quick-dispatch-title">
      <i class="bi bi-lightning-charge-fill"></i>
      <span>Emergency & Quick Dispatch Actions:</span>
    </div>
    <div class="quick-dispatch-actions">
      <button type="button" class="btn btn-navy btn-sm" id="dash-quick-assign-trip-btn">
        <i class="bi bi-send-fill"></i> Assign Trip
      </button>
      <button type="button" class="btn btn-ghost btn-sm" id="dash-quick-add-vehicle">
        <i class="bi bi-plus-circle"></i> Add Vehicle
      </button>
      <button type="button" class="btn btn-ghost btn-sm" id="dash-quick-add-driver">
        <i class="bi bi-person-plus"></i> Add Driver
      </button>
      <button type="button" class="btn btn-ghost btn-sm" id="dash-quick-view-tracking">
        <i class="bi bi-crosshair"></i> Live Tracking
      </button>
      <button type="button" class="btn btn-ghost btn-sm" id="dash-quick-add-maintenance">
        <i class="bi bi-tools"></i> Add Maintenance
      </button>
      <button type="button" class="btn btn-ghost btn-sm" id="dash-quick-generate-report">
        <i class="bi bi-file-earmark-bar-graph"></i> Export Report
      </button>
    </div>
  </div>

  <!-- 6 KPI STAT CARDS (TravelBooking Signature Grid & Luxury Tokens) -->
  <div class="stat-grid-6">
    <!-- Total Registered Vehicles -->
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-icon gold"><i class="bi bi-car-front-fill"></i></span>
        <span class="stat-tag">All Units</span>
      </div>
      <span class="stat-value" id="stat-total-vehicles">{{ $totalVehicles }}</span>
      <span class="stat-label">Total Fleet Units</span>
      <div class="stat-foot gold">
        <i class="bi bi-shield-check"></i> 100% Commissioned
      </div>
    </div>

    <!-- Available Vehicles -->
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-icon green"><i class="bi bi-check-circle-fill"></i></span>
        <span class="stat-tag">Standby</span>
      </div>
      <span class="stat-value" id="stat-available-vehicles">{{ $availableVehicles }}</span>
      <span class="stat-label">Available / Standby</span>
      <div class="stat-foot green">
        <i class="bi bi-arrow-up-right"></i> <span id="stat-readiness-percent">Station Ready</span>
      </div>
    </div>

    <!-- Vehicles on Trips / Active Patrol -->
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-icon navy"><i class="bi bi-broadcast-pin"></i></span>
        <span class="stat-tag">Active</span>
      </div>
      <span class="stat-value" id="stat-ontrip-vehicles">{{ $activeTrips }}</span>
      <span class="stat-label">Active Patrol Units</span>
      <div class="stat-foot">
        <i class="bi bi-geo-alt-fill"></i> GPS Not Connected
      </div>
    </div>

    <!-- Vehicles Under Maintenance -->
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-icon violet"><i class="bi bi-wrench-adjustable-circle-fill"></i></span>
        <span class="stat-tag">Workshop</span>
      </div>
      <span class="stat-value" id="stat-maintenance-vehicles">{{ $maintenanceCount }}</span>
      <span class="stat-label">Under Maintenance</span>
      <div class="stat-foot muted">
        <i class="bi bi-gear-fill"></i> Workshop Diagnostics
      </div>
    </div>

    <!-- Scheduled Dispatches -->
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-icon gold"><i class="bi bi-calendar2-check-fill"></i></span>
        <span class="stat-tag">Queued</span>
      </div>
      <span class="stat-value" id="stat-pending-trips">{{ $scheduledTrips }}</span>
      <span class="stat-label">Scheduled Dispatches</span>
      <div class="stat-foot muted">
        <i class="bi bi-clock-history"></i> Upcoming Shift Orders
      </div>
    </div>

    <!-- Completed Trips -->
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-icon green"><i class="bi bi-flag-fill"></i></span>
        <span class="stat-tag">Archived</span>
      </div>
      <span class="stat-value" id="stat-completed-trips">{{ $completedTrips }}</span>
      <span class="stat-label">Completed Shifts</span>
      <div class="stat-foot green">
        <i class="bi bi-check2-all"></i> Verified Duty Logs
      </div>
    </div>
  </div>

  <!-- ROW 1: TELEMETRIC CHARTS (TravelBooking Card Boxes & Legends) -->
  <div class="row g-3 mb-3">
    <!-- 24h Activity Chart -->
    <div class="col-lg-7">
      <div class="card-box h-100">
        <div class="card-box-head">
          <h2><i class="bi bi-activity"></i> Vehicle Telemetrics Activity</h2>
          <span class="head-sub">24h Dispatches vs Emergency Priority Runs</span>
        </div>
        <div class="card-box-body">
          <div class="chart-legend">
            <span><i class="swatch swatch-navy"></i> Patrol & Intercept Dispatches</span>
            <span><i class="swatch swatch-red"></i> Emergency Priority Runs</span>
          </div>
          <div style="height: 250px; position: relative;">
            <canvas id="dashboard-activity-chart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Fleet Status Distribution -->
    <div class="col-lg-5">
      <div class="card-box h-100">
        <div class="card-box-head">
          <h2><i class="bi bi-pie-chart-fill"></i> Fleet Readiness Distribution</h2>
          <span class="head-sub">Proportional division status</span>
        </div>
        <div class="card-box-body">
          <div class="chart-legend">
            <span><i class="swatch swatch-green"></i> Available</span>
            <span><i class="swatch swatch-navy"></i> On Patrol</span>
            <span><i class="swatch swatch-gold"></i> Maintenance</span>
            <span><i class="swatch swatch-red"></i> Out of Service</span>
          </div>
          <div style="height: 250px; position: relative;">
            <canvas id="dashboard-status-chart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ROW 2: LIVE RADAR TELEMETRY MAP OVERVIEW -->
  <div class="card-box mb-3">
    <div class="card-box-head">
      <div>
        <h2><i class="bi bi-radar"></i> Fleet Location Map</h2>
        <span class="head-sub">Active tactical patrol units across Imo State Police Command &bull; Click any unit icon for specs</span>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="live-pill" style="margin:0;"><span class="live-dot"></span> Awaiting GPS Connection</span>
        <a href="{{ route('tracking.index') }}" class="btn-link-soft">
          Open Full Radar <i class="bi bi-arrow-right"></i>
        </a>
      </div>
    </div>
    <div class="card-box-body" style="padding: 0;">
      <div id="dashboard-mini-map" class="map-wrapper" style="height: 380px; width: 100%; border: none;"></div>
    </div>
  </div>

  <!-- ROW 3: RECENT DISPATCHES & PRIORITY ALERTS -->
  <div class="row g-3 mb-3">
    <!-- Recent Dispatches Table -->
    <div class="col-lg-7">
      <div class="card-box h-100">
        <div class="card-box-head">
          <h2><i class="bi bi-clock-history"></i> Recent Dispatches & Patrol Runs</h2>
          <a href="{{ route('trips.history') }}" class="btn-link-soft">
            View All Manifests <i class="bi bi-arrow-right"></i>
          </a>
        </div>
        <div class="card-box-body" style="padding: 0;">
          <div class="table-responsive">
            <table class="table-clean">
              <thead>
                <tr>
                  <th scope="col">Trip ID</th>
                  <th scope="col">Vehicle</th>
                  <th scope="col">Driver / Officer</th>
                  <th scope="col">Destination</th>
                  <th scope="col">Departure</th>
                  <th scope="col">Status</th>
                  <th scope="col" class="text-end">Action</th>
                </tr>
              </thead>
              <tbody id="dashboard-recent-trips-tbody">
                <!-- Populated dynamically via dashboard.js from MySQL database -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Priority Alerts & Maintenance Reminders -->
    <div class="col-lg-5">
      <div class="card-box h-100">
        <div class="card-box-head">
          <h2><i class="bi bi-exclamation-octagon-fill"></i> Priority Alerts & Service</h2>
          <a href="{{ route('notifications.index') }}" class="btn-link-soft">
            Alert Center <i class="bi bi-arrow-right"></i>
          </a>
        </div>
        <div class="card-box-body">
          <ul class="activity-list" id="dashboard-alerts-list">
            <!-- Populated dynamically via dashboard.js from MySQL database -->
          </ul>
        </div>
      </div>
    </div>
  </div>

</section>
@endsection

@section('scripts')
<script src="{{ asset('js/dashboard.js') }}"></script>
@endsection
