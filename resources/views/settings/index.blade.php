@extends('layouts.app')

@section('title', 'Terminal & Command Settings - Nigeria Police Force Imo State Command')
@section('header_title', 'System Settings & Fleet Administration')
@section('header_subtitle', 'System Settings')

@section('content')
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;" class="form-grid">
  <!-- Administrator Profile Settings -->
  <div class="content-card">
    <div class="card-header">
      <div class="card-title-group">
        <h2 class="card-title"><i class="fa-solid fa-id-badge text-blue-600"></i> Fleet Commander Profile</h2>
        <span class="card-subtitle">Terminal operator identity & credentials</span>
      </div>
    </div>
    <div class="card-body">
      <form id="settings-profile-form">
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="settings-commander-name">Commander Name & Rank</label>
          <input type="text" id="settings-commander-name" class="form-control" />
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="settings-commander-badge">Commander Badge ID</label>
          <input type="text" id="settings-commander-badge" class="form-control" style="font-family: var(--font-mono);" />
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="settings-commander-email">Dispatch Email Address</label>
          <input type="email" id="settings-commander-email" class="form-control" />
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="settings-department">Assigned Bureau / Command</label>
          <input type="text" id="settings-department" class="form-control" />
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label class="form-label" for="settings-terminal-id">Authorized Terminal ID</label>
          <input type="text" id="settings-terminal-id" class="form-control" readonly style="font-family: var(--font-mono); color: var(--text-muted);" />
        </div>

        <button type="submit" class="btn btn-primary">
          <i class="fa-solid fa-floppy-disk"></i> Update Profile
        </button>
      </form>
    </div>
  </div>

  <!-- System & Display Preferences -->
  <div class="content-card">
    <div class="card-header">
      <div class="card-title-group">
        <h2 class="card-title"><i class="fa-solid fa-palette" style="color: var(--accent-gold);"></i> System & Interface Preferences</h2>
        <span class="card-subtitle">Theme, speed unit, and telemetry cadence</span>
      </div>
    </div>
    <div class="card-body">
      <form id="settings-system-form">
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="settings-theme-select">Interface Theme</label>
          <select id="settings-theme-select" class="form-control">
            <option value="light">Light Command (Default Commercial Navy)</option>
            <option value="dark">Dark Tactical Mode</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="settings-speed-unit">Velocity / Telemetry Speed Unit</label>
          <select id="settings-speed-unit" class="form-control">
            <option value="KMH">Kilometers Per Hour (km/h)</option>
            <option value="MPH">Miles Per Hour (MPH)</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="settings-refresh-rate">Simulated GPS Polling Interval (seconds)</label>
          <input type="number" id="settings-refresh-rate" class="form-control" min="2" max="30" value="5" />
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 500;">
            <input type="checkbox" id="settings-audio-alerts" checked style="accent-color: var(--primary);" />
            Enable audible emergency dispatch chime
          </label>
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 500;">
            <input type="checkbox" id="settings-auto-assign" checked style="accent-color: var(--primary);" />
            Auto-activate vehicle telemetry upon trip assignment
          </label>
        </div>

        <button type="submit" class="btn btn-primary">
          <i class="fa-solid fa-check"></i> Save System Preferences
        </button>
      </form>
    </div>
  </div>
</div>

<!-- DEMO DATA MANAGEMENT & SOURCE CODE ARCHIVE -->
<div class="content-card">
  <div class="card-header">
    <div class="card-title-group">
      <h2 class="card-title"><i class="fa-solid fa-database text-blue-600"></i> Database Management & Backup</h2>
      <span class="card-subtitle">MySQL database management, phpMyAdmin compatibility, and backup package</span>
    </div>
  </div>
  <div class="card-body">
    <div style="display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.25rem;">
      <!-- Download Source Code ZIP -->
      <div style="border: 1px solid #bfdbfe; background: rgba(59, 130, 246, 0.08); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: var(--primary);">
          <i class="fa-solid fa-file-zipper"></i> Complete Source ZIP
        </div>
        <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.45;">
          Download <strong>police-fleet-system.zip</strong> containing all 12 frontend pages, master CSS, Vanilla JS modules, and documentation.
        </p>
        <a href="{{ asset('police-fleet-system.zip') }}" download="police-fleet-system.zip" class="btn btn-primary btn-sm btn-download-zip" style="margin-top: auto; text-align:center; text-decoration:none;">
          <i class="fa-solid fa-download"></i> Download police-fleet-system.zip
        </a>
      </div>
    </div>

    <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-muted);">
      <div>
        <i class="fa-solid fa-database"></i> Database: <strong>police-car-tracker</strong> &bull; Engine: MySQL (phpMyAdmin)
      </div>
      <div>
        Nigeria Police Force &bull; Imo State Command &bull; Laravel Framework & MySQL
      </div>
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script src="{{ asset('js/settings.js') }}"></script>
@endsection

