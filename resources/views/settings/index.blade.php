@extends('layouts.app')

@section('title', 'Terminal & Command Settings - Nigeria Police Force Imo State Command')
@section('header_title', 'System Settings & Fleet Administration')
@section('header_subtitle', 'System Settings')

@section('content')
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;" class="form-grid">
  <!-- Administrator Authentication & Login Credentials -->
  <div class="content-card">
    <div class="card-header">
      <div class="card-title-group">
        <h2 class="card-title"><i class="bi bi-shield-lock-fill" style="color: var(--gold);"></i> Admin Login & Access Credentials</h2>
        <span class="card-subtitle">Change Command Email, Service/Badge ID, or Access Passcode</span>
      </div>
    </div>
    <div class="card-body">
      <form action="{{ route('settings.credentials.update') }}" method="POST" id="settings-credentials-form">
        @csrf

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="admin-name">Commander Name & Rank</label>
          <input type="text" name="name" id="admin-name" class="form-control @error('name') is-invalid @enderror" value="{{ old('name', Auth::user()->name) }}" required />
          @error('name')
            <div class="text-danger small mt-1">{{ $message }}</div>
          @enderror
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="admin-badge">Service ID / Badge Number <span class="badge" style="background:var(--cream-soft);color:var(--navy);font-size:10px;padding:2px 6px;">Login Identifier</span></label>
          <input type="text" name="badge_number" id="admin-badge" class="form-control @error('badge_number') is-invalid @enderror" value="{{ old('badge_number', Auth::user()->badge_number) }}" style="font-family: var(--font-mono); font-weight:600;" required />
          <small class="text-muted" style="font-size: 11.5px; display: block; margin-top: 3px;">Officers can log in with this Service ID (e.g., <code>NPF-IMO-001</code>).</small>
          @error('badge_number')
            <div class="text-danger small mt-1">{{ $message }}</div>
          @enderror
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="admin-email">Official Command Email <span class="badge" style="background:var(--cream-soft);color:var(--navy);font-size:10px;padding:2px 6px;">Login Identifier</span></label>
          <input type="email" name="email" id="admin-email" class="form-control @error('email') is-invalid @enderror" value="{{ old('email', Auth::user()->email) }}" required />
          <small class="text-muted" style="font-size: 11.5px; display: block; margin-top: 3px;">Officers can also log in using this command email address.</small>
          @error('email')
            <div class="text-danger small mt-1">{{ $message }}</div>
          @enderror
        </div>

        <hr style="border-color: var(--hairline-soft); margin: 1.25rem 0;" />

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="admin-current-password">Current Passcode <span class="text-danger">*</span></label>
          <input type="password" name="current_password" id="admin-current-password" class="form-control @error('current_password') is-invalid @enderror" placeholder="Enter current passcode to authorize changes" required autocomplete="current-password" />
          <small class="text-muted" style="font-size: 11.5px; display: block; margin-top: 3px;">Required to verify officer identity before saving changes.</small>
          @error('current_password')
            <div class="text-danger small mt-1">{{ $message }}</div>
          @enderror
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="admin-new-password">New Passcode (Optional)</label>
          <input type="password" name="new_password" id="admin-new-password" class="form-control @error('new_password') is-invalid @enderror" placeholder="Leave blank to keep existing passcode" minlength="6" autocomplete="new-password" />
          <small class="text-muted" style="font-size: 11.5px; display: block; margin-top: 3px;">Enter minimum 6 characters only if changing your passcode.</small>
          @error('new_password')
            <div class="text-danger small mt-1">{{ $message }}</div>
          @enderror
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label class="form-label" for="admin-new-password-confirm">Confirm New Passcode</label>
          <input type="password" name="new_password_confirmation" id="admin-new-password-confirm" class="form-control" placeholder="Re-enter new passcode" minlength="6" autocomplete="new-password" />
        </div>

        <button type="submit" class="btn btn-navy" style="width: 100%; justify-content: center;">
          <i class="bi bi-shield-check"></i> Save Login Credentials
        </button>
      </form>
    </div>
  </div>

  <!-- System & Interface Preferences -->
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
          <label class="form-label" for="settings-department">Assigned Bureau / Command</label>
          <input type="text" id="settings-department" class="form-control" />
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="settings-terminal-id">Authorized Terminal ID</label>
          <input type="text" id="settings-terminal-id" class="form-control" readonly style="font-family: var(--font-mono); color: var(--text-muted);" />
        </div>

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
          <label class="form-label" for="settings-refresh-rate">Telemetry Cadence (seconds)</label>
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

        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
          <i class="fa-solid fa-check"></i> Save System Preferences
        </button>
      </form>
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script src="{{ asset('js/settings.js') }}"></script>
@endsection
