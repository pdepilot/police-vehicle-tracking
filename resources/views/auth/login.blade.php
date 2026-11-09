<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nigeria Police Force - Imo State Command | Fleet Tracking System</title>
  <meta name="description" content="Nigeria Police Force Imo State Command - Enterprise Fleet Management and Real-Time Vehicle Tracking System." />
  <meta name="csrf-token" content="{{ csrf_token() }}">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet" />

  <!-- Font Awesome 6 -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

  <!-- Stylesheets -->
  <link rel="stylesheet" href="{{ asset('css/style.css') }}" />
  <link rel="stylesheet" href="{{ asset('css/responsive.css') }}" />
</head>
<body class="login-body">

  <div class="login-card">
    <div class="login-brand">
      <div class="login-badge-emblem">
        <img src="{{ asset('images/nigeria-police-logo.png') }}" alt="Nigeria Police Force Logo" class="npf-main-logo" />
      </div>
      <div>
        <h1 class="login-title">NIGERIA POLICE FORCE</h1>
        <p class="login-subtitle">IMO STATE COMMAND &bull; FLEET TRACKING SYSTEM</p>
      </div>
      <div class="demo-data-pill" style="margin-top: 4px;">
        <i class="fa-solid fa-shield-halved"></i> IMO STATE POLICE COMMAND HQ
      </div>
    </div>

    <!-- PROMINENT ZIP DOWNLOAD CALLOUT -->
    <a href="{{ asset('police-fleet-system.zip') }}" download="police-fleet-system.zip" class="btn btn-primary btn-lg" style="background: linear-gradient(135deg, #059669, #10b981); border: 2px solid #34d399; box-shadow: 0 4px 18px rgba(16, 185, 129, 0.4); text-align: center; text-decoration: none; font-size: 0.95rem; padding: 0.85rem 1rem;">
      <i class="fa-solid fa-file-zipper" style="font-size: 1.25rem;"></i>
      <span><strong>Download Project ZIP</strong> (police-fleet-system.zip)</span>
    </a>

    <!-- Demo Credentials Box -->
    <div class="demo-credentials-box">
      <div><strong><i class="fa-solid fa-key"></i> Authorized Terminal Credentials</strong></div>
      <div style="display: flex; justify-content: space-between; margin-top: 2px;">
        <span>Service No / Email:</span>
        <span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">imo.commander@police.gov.ng</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Access Passcode:</span>
        <span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">IMO-POLICE-911</span>
      </div>
    </div>

    @if($errors->any())
      <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.82rem; margin-bottom: 1rem;">
        <i class="fa-solid fa-circle-exclamation" style="margin-right: 6px;"></i> {{ $errors->first() }}
      </div>
    @endif

    <form class="login-form" id="login-form" method="POST" action="{{ route('login.post') }}">
      @csrf
      <div class="form-group">
        <label class="form-label" for="login-username" style="color: #cbd5e1;">Service ID or Command Email</label>
        <div style="position: relative;">
          <input type="text" name="email" id="login-username" class="form-control" value="{{ old('email', 'imo.commander@police.gov.ng') }}" required placeholder="Enter service # or email" />
          <i class="fa-regular fa-id-badge" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #64748b;"></i>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="login-password" style="color: #cbd5e1;">Terminal Passcode</label>
        <div class="input-password-wrapper">
          <input type="password" name="password" id="login-password" class="form-control" value="IMO-POLICE-911" required placeholder="Enter passcode" />
          <button type="button" class="toggle-pwd-btn" id="btn-toggle-pwd" aria-label="Toggle password visibility">
            <i class="fa-regular fa-eye" id="toggle-pwd-icon"></i>
          </button>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: #cbd5e1;">
        <label style="display: flex; align-items: center; gap: 0.45rem; cursor: pointer;">
          <input type="checkbox" name="remember" id="login-remember" checked style="accent-color: var(--primary);" />
          Remember Terminal
        </label>
        <span style="color: #38bdf8; font-weight: 600; cursor: pointer;" onclick="document.getElementById('login-form').submit()">Quick Login</span>
      </div>

      <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 0.5rem; box-shadow: 0 4px 16px rgba(29, 78, 216, 0.4);">
        <i class="fa-solid fa-arrow-right-to-bracket"></i> Authenticate & Enter Fleet System
      </button>

      <a href="{{ route('dashboard') }}" class="btn btn-secondary btn-sm" style="width: 100%; background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.15); color: #e2e8f0; text-align:center; text-decoration:none;">
        <i class="fa-solid fa-gauge"></i> Bypass to Dashboard Directly
      </a>
    </form>

    <div style="text-align: center; font-size: 0.72rem; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 1rem; margin-top: 0.5rem;">
      <i class="fa-solid fa-lock"></i> Encrypted Terminal Session &bull; Nigeria Police Force &bull; Imo State Command &bull; MySQL Backend
    </div>
  </div>

  <script src="{{ asset('js/storage.js') }}"></script>
  <script src="{{ asset('js/app.js') }}"></script>
  <script>
    // Toggle Password Visibility
    const pwdInput = document.getElementById('login-password');
    const toggleBtn = document.getElementById('btn-toggle-pwd');
    const toggleIcon = document.getElementById('toggle-pwd-icon');

    toggleBtn.addEventListener('click', function () {
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        toggleIcon.className = 'fa-regular fa-eye-slash';
      } else {
        pwdInput.type = 'password';
        toggleIcon.className = 'fa-regular fa-eye';
      }
    });
  </script>
</body>
</html>

