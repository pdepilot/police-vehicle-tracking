@extends('layouts.app')

@section('title', 'Live GPS Telematics & Radar Tracking - Nigeria Police Force Imo State Command')
@section('header_title', 'Live Telemetry & GPS Tracking')
@section('header_subtitle', 'Live Radar')

@section('content')
<!-- TRACKING VIEWPORT (Split sidebar & map) -->
<div class="tracking-viewport" style="margin: -1.5rem; height: calc(100vh - 65px);">
  <!-- Sidebar Units List -->
  <div class="tracking-sidebar-panel">
    <div style="padding: 1rem; border-bottom: 1px solid var(--border-light); background: var(--bg-card-subtle);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
        <span style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; color: var(--text-main);">
          <i class="fa-solid fa-tower-broadcast text-blue-600"></i> Active Patrol Units
        </span>
        <span class="status-pill status-available" id="track-list-count" style="font-size: 0.65rem;">0 units</span>
      </div>

      <div class="search-box" style="width: 100%; min-width: auto; margin-bottom: 0.5rem;">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="track-search-input" class="search-input" placeholder="Search callsign, plate, driver..." style="padding-left: 2.2rem; font-size: 0.78rem;" />
      </div>

      <div style="display: flex; gap: 0.5rem;">
        <select id="track-filter-status" class="filter-select" style="flex: 1; padding: 0.4rem 1.8rem 0.4rem 0.65rem; font-size: 0.75rem;">
          <option value="ALL">All Units</option>
          <option value="On Trip">On Patrol / Trip Only</option>
          <option value="Available">Available Only</option>
          <option value="SIREN">Emergency Siren Active</option>
        </select>

        <span class="text-muted small" id="telemetry-feed-status">
          GPS feed not connected
        </span>
      </div>
    </div>

    <div id="tracking-vehicle-list" style="flex: 1; overflow-y: auto;">
      <!-- Rendered by tracking.js from MySQL database -->
    </div>
  </div>

  <!-- Full Interactive Map -->
  <div class="tracking-map-container" style="position: relative;">
    <div id="tracking-full-map" style="width: 100%; height: 100%;"></div>

    <!-- Bottom Floating Telemetry Drawer for Selected Vehicle -->
    <div class="tracking-telemetry-drawer" id="tracking-telemetry-drawer">
      <div style="background: var(--navy-dark); color: #fff; padding: 0.85rem 1.25rem; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span class="plate-badge" id="drawer-veh-reg" style="font-size: 0.75rem;">POL-0000</span>
          <strong id="drawer-veh-callsign" style="font-size: 1rem; color: #38bdf8;">Call Sign</strong>
        </div>
        <button id="btn-close-telemetry-drawer" style="background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer;">&times;</button>
      </div>

      <div style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div id="drawer-veh-makemodel" style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">Ford Police Interceptor</div>
            <div id="drawer-veh-dept" style="font-size: 0.72rem; color: var(--text-muted);">Patrol Division</div>
          </div>
          <span id="drawer-status-pill" class="status-pill status-ontrip">
            <span class="dot"></span> On Patrol
          </span>
        </div>

        <!-- Speed & Telemetry Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem; background: var(--bg-card-subtle); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); text-align: center;">
          <div>
            <span style="font-size: 0.68rem; color: var(--text-muted); display: block;">Speed</span>
            <strong id="drawer-veh-speed" style="font-family: var(--font-mono); font-size: 1.15rem; color: var(--primary);">0 km/h</strong>
          </div>
          <div>
            <span style="font-size: 0.68rem; color: var(--text-muted); display: block;">Heading</span>
            <strong id="drawer-veh-heading" style="font-family: var(--font-mono); font-size: 1.15rem; color: var(--text-main);">NW</strong>
          </div>
          <div>
            <span style="font-size: 0.68rem; color: var(--text-muted); display: block;">Fuel / Batt</span>
            <strong id="drawer-veh-fuel" style="font-family: var(--font-mono); font-size: 1.15rem; color: #16a34a;">85%</strong>
          </div>
        </div>

        <div style="font-size: 0.78rem; display: flex; flex-direction: column; gap: 4px;">
          <div><strong>Assigned Officer:</strong> <span id="drawer-veh-driver">Sgt. Marcus Cole</span></div>
          <div><strong>Current Sector / Location:</strong> <span id="drawer-veh-location">Expressway Sector 4</span></div>
          <div><strong>GPS Coordinates:</strong> <span id="drawer-veh-coords" style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">37.7749, -122.4194</span></div>
          <div><strong>Total Distance:</strong> <span id="drawer-veh-mileage">24,120 km</span></div>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-top: 0.25rem;">
          <button id="btn-toggle-siren" class="btn btn-secondary btn-sm" style="flex: 1;">
            <i class="fa-solid fa-bullhorn"></i> Toggle Siren
          </button>
          <a href="{{ route('trips.index') }}" class="btn btn-primary btn-sm" style="flex: 1; text-align:center;">
            <i class="fa-solid fa-route"></i> Dispatch
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script src="{{ asset('js/tracking.js') }}"></script>
@endsection

