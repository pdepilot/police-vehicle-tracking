<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>@yield('title', 'Nigeria Police Force (Imo State Command) - Fleet Operations')</title>
  <meta name="description" content="Nigeria Police Force Imo State Command - Enterprise Fleet Management and Real-Time Vehicle Tracking System." />
  <link rel="icon" type="image/png" href="{{ asset('images/nigeria-police-logo.png') }}" />

  <!-- Google Fonts: Cormorant Garamond & DM Sans (TravelBooking Typography) + JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <!-- Bootstrap 5.3.3 & Bootstrap Icons (TravelBooking Framework) -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet" />

  <!-- Font Awesome 6 -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

  <!-- TravelBooking Master Stylesheet & Police Theme Integration -->
  <link rel="stylesheet" href="{{ asset('css/travelbooking-admin.css') }}" />
  <link rel="stylesheet" href="{{ asset('css/police-travelbooking-integration.css') }}" />
  <link rel="stylesheet" href="{{ asset('css/style.css') }}" />
  <link rel="stylesheet" href="{{ asset('css/responsive.css') }}" />
  @yield('styles')

  <script>document.documentElement.classList.add('js');</script>
</head>
<body data-page="{{ request()->route() ? request()->route()->getName() : 'dashboard' }}">
  <a href="#adminMain" class="skip-link">Skip to dashboard content</a>

  <div class="dash-shell">

    <!-- FLOATING SIDE NAVIGATION (TravelBooking Signature Rail with Hover Expansion) -->
    <nav class="float-nav sidebar-nav" id="floatNav" aria-label="Police Fleet navigation">
      <a class="float-brand" href="{{ route('dashboard') }}" aria-label="Nigeria Police Force Home" title="NPF Imo State Command">
        <img src="{{ asset('images/nigeria-police-logo.png') }}" alt="NPF" style="width:28px;height:28px;object-fit:contain;flex-shrink:0;" />
        <span class="float-btn-label">NPF Imo Command</span>
      </a>

      <div class="float-nav-divider" aria-hidden="true"></div>

      <!-- Command & Operations -->
      <a class="float-btn nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}" href="{{ route('dashboard') }}" {{ request()->routeIs('dashboard') ? 'aria-current="page"' : '' }} aria-label="Dashboard" title="Operations Dashboard">
        <i class="bi bi-grid-1x2-fill"></i>
        <span class="float-btn-label">Dashboard</span>
      </a>

      <a class="float-btn nav-link {{ request()->routeIs('tracking.*') ? 'active' : '' }}" href="{{ route('tracking.index') }}" {{ request()->routeIs('tracking.*') ? 'aria-current="page"' : '' }} aria-label="Live Tracking" title="Live GPS Radar Tracking">
        <i class="bi bi-geo-alt-fill"></i>
        <span class="float-btn-label">Live Tracking</span>
        <span class="float-badge" style="background:var(--gold);color:var(--navy-deep);">GPS</span>
      </a>

      <a class="float-btn nav-link {{ request()->routeIs('trips.index') ? 'active' : '' }}" href="{{ route('trips.index') }}" {{ request()->routeIs('trips.index') ? 'aria-current="page"' : '' }} aria-label="Dispatches" title="Trip Assignments">
        <i class="bi bi-send-fill"></i>
        <span class="float-btn-label">Dispatches</span>
        <span class="float-badge" id="nav-badge-trips" style="display:none;">0</span>
      </a>

      <a class="float-btn nav-link {{ request()->routeIs('trips.history') ? 'active' : '' }}" href="{{ route('trips.history') }}" {{ request()->routeIs('trips.history') ? 'aria-current="page"' : '' }} aria-label="Trip History" title="Duty Trip History">
        <i class="bi bi-clock-history"></i>
        <span class="float-btn-label">Trip History</span>
      </a>

      <div class="float-nav-divider" aria-hidden="true"></div>

      <!-- Fleet Assets & Personnel -->
      <a class="float-btn nav-link {{ request()->routeIs('vehicles.*') ? 'active' : '' }}" href="{{ route('vehicles.index') }}" {{ request()->routeIs('vehicles.*') ? 'aria-current="page"' : '' }} aria-label="Vehicles" title="Vehicle Inventory">
        <i class="bi bi-car-front-fill"></i>
        <span class="float-btn-label">Vehicles</span>
        <span class="float-badge" id="badgeVehicles">{{ $totalVehicles ?? '' }}</span>
      </a>

      <a class="float-btn nav-link {{ request()->routeIs('drivers.*') ? 'active' : '' }}" href="{{ route('drivers.index') }}" {{ request()->routeIs('drivers.*') ? 'aria-current="page"' : '' }} aria-label="Drivers" title="Driver & Officer Roster">
        <i class="bi bi-person-badge-fill"></i>
        <span class="float-btn-label">Officers & Drivers</span>
        <span class="float-badge" id="badgeDrivers">{{ $totalDrivers ?? '' }}</span>
      </a>

      <a class="float-btn nav-link {{ request()->routeIs('maintenance.*') ? 'active' : '' }}" href="{{ route('maintenance.index') }}" {{ request()->routeIs('maintenance.*') ? 'aria-current="page"' : '' }} aria-label="Maintenance" title="Workshop Maintenance">
        <i class="bi bi-wrench-adjustable-circle-fill"></i>
        <span class="float-btn-label">Maintenance</span>
        <span class="float-badge" id="nav-badge-mnt" style="display:none;">0</span>
      </a>

      <a class="float-btn nav-link {{ request()->routeIs('fuel.*') ? 'active' : '' }}" href="{{ route('fuel.index') }}" {{ request()->routeIs('fuel.*') ? 'aria-current="page"' : '' }} aria-label="Fuel" title="Fuel & Logistics">
        <i class="bi bi-fuel-pump-fill"></i>
        <span class="float-btn-label">Fuel Logistics</span>
      </a>

      <div class="float-nav-divider" aria-hidden="true"></div>

      <!-- Intelligence & Settings -->
      <a class="float-btn nav-link {{ request()->routeIs('notifications.*') ? 'active' : '' }}" href="{{ route('notifications.index') }}" {{ request()->routeIs('notifications.*') ? 'aria-current="page"' : '' }} aria-label="Notifications" title="Command Notifications">
        <i class="bi bi-bell-fill"></i>
        <span class="float-btn-label">Notifications</span>
        <span class="float-badge" id="nav-badge-notif" style="display:none;">0</span>
      </a>

      <a class="float-btn nav-link {{ request()->routeIs('reports.*') ? 'active' : '' }}" href="{{ route('reports.index') }}" {{ request()->routeIs('reports.*') ? 'aria-current="page"' : '' }} aria-label="Reports" title="Reports & Analytics">
        <i class="bi bi-bar-chart-fill"></i>
        <span class="float-btn-label">Reports</span>
      </a>

      <a class="float-btn nav-link {{ request()->routeIs('settings.*') ? 'active' : '' }}" href="{{ route('settings.index') }}" {{ request()->routeIs('settings.*') ? 'aria-current="page"' : '' }} aria-label="Settings" title="System Settings">
        <i class="bi bi-gear-fill"></i>
        <span class="float-btn-label">Settings</span>
      </a>

      <div class="float-nav-divider" aria-hidden="true"></div>

      <!-- Logout Modal Trigger -->
      <button type="button" class="float-btn logout" data-bs-toggle="modal" data-bs-target="#logoutModal" aria-label="Logout" title="Sign out of Command">
        <i class="bi bi-box-arrow-right"></i>
        <span class="float-btn-label">Sign Out</span>
      </button>
    </nav>

    <!-- MAIN DASHBOARD CONTENT AREA -->
    <div class="admin-main" id="adminMain">

      <!-- TOPBAR (TravelBooking Header Styling) -->
      <header class="dash-topbar">
        <div class="topbar-left">
          <a href="{{ route('dashboard') }}" class="topbar-brand-link" title="Nigeria Police Force Imo State Command" style="display:inline-flex;align-items:center;text-decoration:none;margin-right:8px;">
            <img src="{{ asset('images/nigeria-police-logo.png') }}" alt="Nigeria Police Force" style="height:32px;width:auto;object-fit:contain;" />
          </a>
          <div class="topbar-crumb">
            <i class="bi bi-house-door-fill"></i>
            <a href="{{ route('dashboard') }}" style="color:var(--muted);text-decoration:none;">HQ</a>
            <span class="sep">/</span>
            <span class="current" id="crumbCurrent">@yield('header_title', 'Operations Dashboard')</span>
          </div>
        </div>

        <div class="topbar-right">
          <!-- Live Clock -->
          <div class="topbar-clock" id="header-live-clock">
            <i class="bi bi-clock-history"></i> <span>Initializing...</span>
          </div>

          <!-- Command Badge -->
          <span class="demo-pill">
            <i class="bi bi-shield-check"></i> IMO POLICE HQ
          </span>

          <!-- Download ZIP Button -->
          <a href="{{ asset('police-fleet-system.zip') }}" download="police-fleet-system.zip" class="btn btn-ghost btn-xs" title="Download Complete Project ZIP Archive" style="text-decoration:none;">
            <i class="bi bi-download"></i>
            <span>ZIP ARCHIVE</span>
          </a>

          <!-- Notifications Dropdown Button -->
          <div style="position: relative;">
            <button type="button" class="icon-btn" id="notif-dropdown-btn" aria-label="Notifications" title="Dispatch Alerts">
              <i class="bi bi-bell-fill"></i>
              <span class="dot" id="notif-badge-count" style="display:none;" aria-hidden="true"></span>
            </button>

            <!-- Dropdown Popover -->
            <div class="dropdown-menu" id="notif-dropdown-menu">
              <div class="dropdown-header">
                <span class="dropdown-title">
                  <i class="bi bi-bell-fill" style="color:var(--gold);"></i> Dispatch Alerts
                </span>
                <button type="button" class="btn btn-ghost btn-xs" id="dropdown-mark-all-btn">Mark Read</button>
              </div>
              <div class="dropdown-body" id="dropdown-notif-list">
                <!-- Rendered dynamically via app.js -->
              </div>
              <div class="dropdown-footer">
                <a href="{{ route('notifications.index') }}">View All Notifications <i class="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>

          <!-- User Profile Monogram Pill -->
          <div style="position: relative;">
            <div class="topbar-user" id="user-profile-btn" role="button" tabindex="0">
              <span class="avatar">NPF</span>
              <span>{{ Auth::user()->name ?? 'Imo State Command' }}</span>
              <i class="bi bi-chevron-down" style="font-size: 10px; color: var(--muted); margin-left: 4px;"></i>
            </div>

            <div class="dropdown-menu user-dropdown-menu" id="user-dropdown-menu">
              <a href="{{ route('settings.index') }}" class="user-dropdown-item">
                <i class="bi bi-person-badge"></i> Officer Profile
              </a>
              <a href="{{ route('settings.index') }}" class="user-dropdown-item">
                <i class="bi bi-sliders"></i> System Settings
              </a>
              <div style="border-top: 1px solid var(--hairline-soft); margin: 4px 0;"></div>
              <div class="user-dropdown-item danger" onclick="document.getElementById('logout-form').submit();">
                <i class="bi bi-box-arrow-right"></i> Sign Out
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- FLASH NOTIFICATIONS -->
      <div class="admin-content" style="padding-bottom: 0;">
        @if(session('success'))
          <div class="info-note" style="border-left-color: var(--green); background: var(--green-soft); color: var(--green);">
            <i class="bi bi-check-circle-fill" style="color: var(--green);"></i>
            <div>{{ session('success') }}</div>
          </div>
        @endif

        @if(isset($errors) && $errors->any())
          <div class="info-note" style="border-left-color: var(--error); background: var(--error-soft); color: var(--error);">
            <i class="bi bi-exclamation-triangle-fill" style="color: var(--error);"></i>
            <div>
              <ul style="margin: 0; padding-left: 1rem;">
                @foreach($errors->all() as $error)
                  <li>{{ $error }}</li>
                @endforeach
              </ul>
            </div>
          </div>
        @endif
      </div>

      <!-- MAIN PAGE CONTENT -->
      <div class="admin-content">
        @yield('content')
      </div>

      <!-- FOOTER -->
      <footer class="admin-footer">
        <p class="mb-0">
          &copy; <span id="year">{{ date('Y') }}</span> Nigeria Police Force — Imo State Command Fleet Telemetrics.
        </p>
        <ul>
          <li><a href="{{ route('dashboard') }}">Dashboard</a></li>
          <li><a href="{{ route('tracking.index') }}">Live Radar</a></li>
          <li><a href="{{ route('reports.index') }}">Reports</a></li>
          <li><a href="{{ route('settings.index') }}">Settings</a></li>
        </ul>
      </footer>

    </div>
  </div>

  <!-- LOGOUT MODAL -->
  <div class="modal fade" id="logoutModal" tabindex="-1" aria-labelledby="logoutModalTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content" style="background:var(--ivory);border:1px solid var(--hairline);border-radius:0;">
        <div class="modal-header" style="border-bottom:1px solid var(--hairline-soft);">
          <h5 class="modal-title" id="logoutModalTitle" style="font-family:'Cormorant Garamond',serif;color:var(--navy);font-size:1.35rem;">
            <i class="bi bi-box-arrow-right" style="color:var(--gold);"></i> Sign Out Session
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" style="font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink-soft);line-height:1.7;">
          <p class="mb-2">Are you sure you want to exit the Nigeria Police Force Fleet Command session?</p>
          <div class="info-note mb-0" style="margin-top:12px;background:var(--cream-soft);border-left-color:var(--navy);">
            <i class="bi bi-shield-lock" style="color:var(--navy);"></i>
            <div>Your command credentials will be securely signed out.</div>
          </div>
        </div>
        <div class="modal-footer" style="border-top:1px solid var(--hairline-soft);">
          <button type="button" class="btn btn-ghost btn-sm" data-bs-dismiss="modal">Cancel</button>
          <form action="{{ route('logout') }}" method="POST" id="logout-form" style="display:inline;">
            @csrf
            <button type="submit" class="btn btn-danger-soft btn-sm">
              <i class="bi bi-box-arrow-right"></i> Confirm Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap 5.3.3 Bundle -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Leaflet.js & Chart.js CDNs -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  <!-- Core App Scripts -->
  <script src="{{ asset('js/storage.js') }}"></script>
  <script src="{{ asset('js/app.js') }}"></script>
  @yield('scripts')
</body>
</html>
