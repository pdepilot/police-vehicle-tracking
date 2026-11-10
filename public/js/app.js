/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * Application Core Utilities (Vanilla JavaScript)
 */

(function (window) {
  'use strict';

  // Apply Theme from settings immediately
  function applyTheme() {
    if (window.FleetStorage) {
      const settings = window.FleetStorage.getSettings();
      if (settings && settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme);
      }
    }
  }
  applyTheme();

  // Highlight Active Link in Sidebar & Command Navbar
  function highlightActiveSidebar() {
    const currentPathname = (window.location.pathname.replace(/\/+$/, '') || '/dashboard').toLowerCase();
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link, .command-nav-item');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      try {
        const linkUrl = new URL(link.href, window.location.origin);
        const linkPath = (linkUrl.pathname.replace(/\/+$/, '') || '/dashboard').toLowerCase();
        
        const isExact = (linkPath === currentPathname) ||
                        ((currentPathname === '' || currentPathname === '/') && (linkPath === '/dashboard' || linkPath === ''));
        const isSubPath = linkPath !== '/dashboard' && linkPath !== '/' && linkPath.length > 1 && currentPathname.startsWith(linkPath);
        
        if (isExact || isSubPath) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          // If server blade set active and it matches module prefix, keep it; otherwise remove
          if (!currentPathname.includes(linkPath.replace(/^\//, ''))) {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
          }
        }
      } catch (e) {}
    });
  }

  // Live Digital Clock in Top Header
  function initLiveClock() {
    const clockEl = document.getElementById('header-live-clock');
    if (!clockEl) return;

    function update() {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      clockEl.innerHTML = `<i class="bi bi-clock-history"></i> <span>${dateStr} &bull; ${timeStr}</span>`;
    }
    update();
    setInterval(update, 1000);
  }

  // Update Dynamic Badges across UI
  function updateDynamicBadges() {
    if (!window.FleetStorage) return;

    // Notifications badge
    const notifications = window.FleetStorage.getNotifications();
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const notifBadge = document.getElementById('notif-badge-count');
    if (notifBadge) {
      notifBadge.textContent = unreadCount;
      notifBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    const navNotifBadge = document.getElementById('nav-badge-notif');
    if (navNotifBadge) {
      navNotifBadge.textContent = unreadCount;
      navNotifBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    // Active trips badge
    const trips = window.FleetStorage.getTrips();
    const activeTripsCount = trips.filter(t => t.status === 'Active').length;
    const navTripsBadge = document.getElementById('nav-badge-trips');
    if (navTripsBadge) {
      navTripsBadge.textContent = activeTripsCount;
      navTripsBadge.style.display = activeTripsCount > 0 ? 'inline-block' : 'none';
    }

    // Maintenance badge
    const maintenance = window.FleetStorage.getMaintenance();
    const activeMntCount = maintenance.filter(m => m.status === 'In Progress' || m.status === 'Pending').length;
    const navMntBadge = document.getElementById('nav-badge-mnt');
    if (navMntBadge) {
      navMntBadge.textContent = activeMntCount;
      navMntBadge.style.display = activeMntCount > 0 ? 'inline-block' : 'none';
    }
  }

  // Render Top Header Notifications Dropdown
  function setupNotificationDropdown() {
    const toggleBtn = document.getElementById('notif-dropdown-btn');
    const dropdown = document.getElementById('notif-dropdown-menu');
    const markAllBtn = document.getElementById('dropdown-mark-all-btn');
    const listContainer = document.getElementById('dropdown-notif-list');

    if (!toggleBtn || !dropdown) return;

    function renderList() {
      if (!listContainer) return;
      const notifs = window.FleetStorage.getNotifications().slice(0, 5);
      if (notifs.length === 0) {
        listContainer.innerHTML = `
          <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
            <i class="fa-regular fa-bell-slash" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
            No notifications available
          </div>
        `;
        return;
      }

      listContainer.innerHTML = notifs.map(n => {
        let iconClass = 'fa-info text-blue-500';
        let bgStyle = 'background: #eff6ff; color: #1d4ed8;';
        if (n.type === 'alert') {
          iconClass = 'fa-triangle-exclamation';
          bgStyle = 'background: #fef2f2; color: #dc2626;';
        } else if (n.type === 'assignment') {
          iconClass = 'fa-route';
          bgStyle = 'background: #f0fdf4; color: #16a34a;';
        } else if (n.type === 'maintenance') {
          iconClass = 'fa-wrench';
          bgStyle = 'background: #fffbeb; color: #d97706;';
        } else if (n.type === 'completed') {
          iconClass = 'fa-check-circle';
          bgStyle = 'background: #f5f3ff; color: #7c3aed;';
        }

        return `
          <div class="notification-item-small ${n.isRead ? '' : 'unread'}" onclick="FleetApp.handleNotificationClick('${n.id}')">
            <div class="notif-icon-circle" style="${bgStyle}">
              <i class="fa-solid ${iconClass}"></i>
            </div>
            <div class="notif-content">
              <div class="notif-title">${n.title}</div>
              <div class="notif-time"><i class="fa-regular fa-clock"></i> ${n.timestamp}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isVisible = dropdown.classList.contains('show');
      closeAllDropdowns();
      if (!isVisible) {
        renderList();
        dropdown.classList.add('show');
      }
    });

    if (markAllBtn) {
      markAllBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        window.FleetStorage.markAllNotificationsRead();
        updateDynamicBadges();
        renderList();
        FleetApp.showToast('Updated', 'All notifications marked as read', 'success');
      });
    }
  }

  // Setup User Profile Dropdown
  function setupUserDropdown() {
    const userBtn = document.getElementById('user-profile-btn');
    const userMenu = document.getElementById('user-dropdown-menu');
    if (!userBtn || !userMenu) return;

    userBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isVisible = userMenu.classList.contains('show');
      closeAllDropdowns();
      if (!isVisible) {
        userMenu.classList.add('show');
      }
    });
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(el => {
      el.classList.remove('show');
    });
  }

  document.addEventListener('click', function () {
    closeAllDropdowns();
  });

  // Mobile Sidebar Toggle
  function setupMobileSidebar() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (!toggleBtn || !sidebar) return;

    function openSidebar() {
      sidebar.classList.add('mobile-open');
      if (backdrop) backdrop.classList.add('active');
    }

    function closeSidebar() {
      sidebar.classList.remove('mobile-open');
      if (backdrop) backdrop.classList.remove('active');
    }

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (sidebar.classList.contains('mobile-open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    if (backdrop) {
      backdrop.addEventListener('click', closeSidebar);
    }
  }

  // Toast System
  function showToast(title, message, type = 'primary', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'danger') icon = 'fa-circle-exclamation';

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fa-solid ${icon}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  // Modal Open / Close
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  // Confirm Dialog (No window.confirm!)
  function confirmModal(title, message, onConfirm) {
    let confirmBox = document.getElementById('app-confirm-modal');
    if (!confirmBox) {
      confirmBox = document.createElement('div');
      confirmBox.id = 'app-confirm-modal';
      confirmBox.className = 'modal-overlay';
      confirmBox.innerHTML = `
        <div class="modal-box" style="max-width: 420px;">
          <div class="modal-header">
            <h3 class="modal-title" id="confirm-modal-title"><i class="fa-solid fa-triangle-exclamation text-amber-500"></i> Confirm Action</h3>
            <button class="modal-close-btn" id="confirm-modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p id="confirm-modal-desc" style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.5;"></p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="confirm-modal-cancel">Cancel</button>
            <button class="btn btn-danger" id="confirm-modal-proceed">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(confirmBox);
    }

    document.getElementById('confirm-modal-title').innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i> ${title}`;
    document.getElementById('confirm-modal-desc').textContent = message;

    const cancelBtn = document.getElementById('confirm-modal-cancel');
    const closeBtn = document.getElementById('confirm-modal-close');
    const proceedBtn = document.getElementById('confirm-modal-proceed');

    function close() {
      confirmBox.classList.remove('show');
      document.body.style.overflow = '';
    }

    cancelBtn.onclick = close;
    closeBtn.onclick = close;
    proceedBtn.onclick = function () {
      close();
      if (typeof onConfirm === 'function') onConfirm();
    };

    confirmBox.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  // Export Array of Objects to CSV File
  function exportToCSV(filename, rows) {
    if (!rows || !rows.length) {
      showToast('Export Error', 'No data available to export', 'warning');
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k].toString();
          cell = cell.replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Successful', `Exported ${rows.length} records to ${filename}`, 'success');
  }

  // Download Complete Project ZIP
  function downloadProjectZip() {
    const link = document.createElement('a');
    link.href = 'police-fleet-system.zip';
    link.download = 'police-fleet-system.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Download Started', 'Downloading police-fleet-system.zip archive...', 'success');
  }

  // Handle Click on Notification in Dropdown
  function handleNotificationClick(id) {
    if (window.FleetStorage) {
      window.FleetStorage.markNotificationRead(id);
      updateDynamicBadges();
      window.location.href = '/notifications';
    }
  }

  // Listen to Global Storage Updates
  window.addEventListener('fleet_data_updated', function () {
    updateDynamicBadges();
  });

  // Initialize Page Setup on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    highlightActiveSidebar();
    initLiveClock();
    updateDynamicBadges();
    setupNotificationDropdown();
    setupUserDropdown();
    setupMobileSidebar();

    // Attach Download ZIP buttons if present
    document.querySelectorAll('.btn-download-zip').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        downloadProjectZip();
      });
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          overlay.classList.remove('show');
          document.body.style.overflow = '';
        }
      });
    });
  });

  // 3D Vehicular Representation Generator for Leaflet Maps
  function get3DVehicleDivIcon(veh, isSelected) {
    if (!window.L) return null;

    const headingAngles = {
      'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
      'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
      'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
      'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
    };

    let headingDeg = 0;
    if (typeof veh.heading === 'number') {
      headingDeg = veh.heading;
    } else if (veh.heading && headingAngles[veh.heading.toUpperCase()] !== undefined) {
      headingDeg = headingAngles[veh.heading.toUpperCase()];
    } else if (veh.heading && !isNaN(parseFloat(veh.heading))) {
      headingDeg = parseFloat(veh.heading);
    }

    const isOnTrip = veh.status === 'On Trip';
    const isSiren = Boolean(veh.sirenActive);
    const type = veh.type || 'SUV';

    let bodySvg = '';

    if (type === 'Motorcycle') {
      bodySvg = `
        <svg viewBox="0 0 54 64" width="54" height="64" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="27" cy="34" rx="12" ry="22" fill="rgba(6,15,33,0.4)" filter="blur(2.5px)" />
          <rect x="25" y="6" width="4" height="12" rx="2" fill="#1e293b" />
          <rect x="25" y="44" width="4" height="14" rx="2" fill="#1e293b" />
          <path d="M24 18 L30 18 L31 46 L23 46 Z" fill="#334155" />
          <rect x="21" y="38" width="2" height="14" fill="#94a3b8" />
          <rect x="31" y="38" width="2" height="14" fill="#94a3b8" />
          <rect x="15" y="34" width="7" height="14" rx="1.5" fill="#0b1e3d" stroke="#a8842c" stroke-width="0.8" />
          <rect x="32" y="34" width="7" height="14" rx="1.5" fill="#0b1e3d" stroke="#a8842c" stroke-width="0.8" />
          <ellipse cx="27" cy="28" rx="6" ry="8" fill="#1e3a5f" />
          <circle cx="27" cy="23" r="4.5" fill="#f8fafc" stroke="#0b1e3d" stroke-width="1" />
          <path d="M24 22 L30 22" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round" />
          <path d="M21 15 Q27 10 33 15 L32 20 L22 20 Z" fill="#0b1e3d" stroke="#a8842c" stroke-width="0.8" />
          <path d="M23 15 Q27 12 31 15" stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.85" />
          <circle cx="20" cy="14" r="2.2" fill="#0066ff" class="${isOnTrip || isSiren ? 'strobe-blue' : ''}" />
          <circle cx="34" cy="14" r="2.2" fill="#ff1a3c" class="${isOnTrip || isSiren ? 'strobe-red' : ''}" />
          <line x1="34" y1="42" x2="34" y2="34" stroke="#94a3b8" stroke-width="1" />
          <circle cx="34" cy="33" r="2" fill="#0066ff" class="${isOnTrip || isSiren ? 'strobe-blue' : ''}" />
        </svg>
      `;
    } else if (type === 'Sedan') {
      bodySvg = `
        <svg viewBox="0 0 54 64" width="54" height="64" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="27" cy="36" rx="16" ry="24" fill="rgba(6,15,33,0.45)" filter="blur(3px)" />
          <path d="M20 7 L34 7 L33 10 L21 10 Z" fill="#0f172a" stroke="#475569" stroke-width="0.8" />
          <line x1="22" y1="7" x2="22" y2="12" stroke="#e2e8f0" stroke-width="1" />
          <line x1="32" y1="7" x2="32" y2="12" stroke="#e2e8f0" stroke-width="1" />
          <rect x="13" y="10" width="28" height="46" rx="6" fill="#0b1e3d" stroke="#a8842c" stroke-width="1" />
          <path d="M16 11 L38 11 L37 23 L17 23 Z" fill="#122647" />
          <line x1="27" y1="12" x2="27" y2="21" stroke="#a8842c" stroke-width="0.8" opacity="0.6" />
          <ellipse cx="16" cy="11" rx="2.5" ry="1.5" fill="#fef08a" />
          <ellipse cx="38" cy="11" rx="2.5" ry="1.5" fill="#fef08a" />
          <path d="M16 23 L38 23 L36 30 L18 30 Z" fill="#1e3a5f" stroke="#38bdf8" stroke-width="0.8" />
          <line x1="20" y1="25" x2="32" y2="28" stroke="#ffffff" stroke-width="1" opacity="0.4" />
          <rect x="17" y="30" width="20" height="15" rx="2" fill="#0b1e3d" />
          <text x="27" y="39" font-family="'DM Sans',sans-serif" font-size="5" font-weight="700" fill="#a8842c" text-anchor="middle" letter-spacing="0.5">NPF</text>
          <rect x="16" y="32" width="22" height="4" rx="1.5" fill="#091427" stroke="#475569" stroke-width="0.6" />
          <rect x="17" y="33" width="9" height="2" rx="1" fill="#0066ff" class="${isOnTrip || isSiren ? 'strobe-blue' : ''}" />
          <rect x="28" y="33" width="9" height="2" rx="1" fill="#ff1a3c" class="${isOnTrip || isSiren ? 'strobe-red' : ''}" />
          <path d="M18 45 L36 45 L37 50 L17 50 Z" fill="#1e3a5f" opacity="0.9" />
          <path d="M15 50 L39 50 L38 55 L16 55 Z" fill="#122647" />
          <line x1="14" y1="54" x2="40" y2="54" stroke="#a8842c" stroke-width="1.2" />
          <rect x="15" y="55" width="5" height="1.5" fill="#ef4444" />
          <rect x="34" y="55" width="5" height="1.5" fill="#ef4444" />
        </svg>
      `;
    } else if (type === 'Armored Tactical') {
      bodySvg = `
        <svg viewBox="0 0 54 64" width="54" height="64" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="27" cy="36" rx="19" ry="25" fill="rgba(6,15,33,0.5)" filter="blur(3.5px)" />
          <rect x="13" y="6" width="28" height="5" rx="1.5" fill="#1e293b" stroke="#64748b" stroke-width="1" />
          <line x1="18" y1="6" x2="18" y2="11" stroke="#f59e0b" stroke-width="1.2" />
          <line x1="36" y1="6" x2="36" y2="11" stroke="#f59e0b" stroke-width="1.2" />
          <polygon points="12,11 42,11 44,52 38,58 16,58 10,52" fill="#0f172a" stroke="#a8842c" stroke-width="1.2" />
          <rect x="16" y="18" width="9" height="5" rx="1" fill="#0284c7" stroke="#38bdf8" stroke-width="0.8" />
          <rect x="29" y="18" width="9" height="5" rx="1" fill="#0284c7" stroke="#38bdf8" stroke-width="0.8" />
          <circle cx="27" cy="33" r="8" fill="#1e293b" stroke="#a8842c" stroke-width="1.5" />
          <circle cx="27" cy="33" r="5" fill="#0f172a" />
          <rect x="14" y="24" width="6" height="3" rx="1" fill="#0066ff" class="${isOnTrip || isSiren ? 'strobe-blue' : ''}" />
          <rect x="34" y="24" width="6" height="3" rx="1" fill="#ff1a3c" class="${isOnTrip || isSiren ? 'strobe-red' : ''}" />
          <rect x="9" y="25" width="2.5" height="18" rx="1" fill="#334155" />
          <rect x="42.5" y="25" width="2.5" height="18" rx="1" fill="#334155" />
          <text x="27" y="49" font-family="'DM Sans',sans-serif" font-size="5" font-weight="800" fill="#f8fafc" text-anchor="middle" letter-spacing="1">SWAT</text>
        </svg>
      `;
    } else {
      // Default & SUV (Pursuit Utility)
      bodySvg = `
        <svg viewBox="0 0 54 64" width="54" height="64" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="27" cy="36" rx="18" ry="25" fill="rgba(6,15,33,0.45)" filter="blur(3px)" />
          <path d="M18 6 L36 6 L35 10 L19 10 Z" fill="#0f172a" stroke="#64748b" stroke-width="1" />
          <circle cx="22" cy="7.5" r="1.5" fill="#f59e0b" />
          <circle cx="32" cy="7.5" r="1.5" fill="#f59e0b" />
          <rect x="12" y="10" width="30" height="48" rx="7" fill="#0b1e3d" stroke="#a8842c" stroke-width="1.1" />
          <path d="M15 11 L39 11 L38 23 L16 23 Z" fill="#132a4e" />
          <rect x="20" y="13" width="14" height="7" rx="2" fill="#0b1e3d" opacity="0.6" />
          <ellipse cx="15.5" cy="11.5" rx="2.8" ry="1.8" fill="#fef08a" />
          <ellipse cx="38.5" cy="11.5" rx="2.8" ry="1.8" fill="#fef08a" />
          <circle cx="12" cy="22" r="2" fill="#e2e8f0" stroke="#0f172a" stroke-width="0.8" />
          <circle cx="42" cy="22" r="2" fill="#e2e8f0" stroke="#0f172a" stroke-width="0.8" />
          <path d="M15 23 L39 23 L37 31 L17 31 Z" fill="#173154" stroke="#38bdf8" stroke-width="0.8" />
          <line x1="19" y1="25" x2="33" y2="29" stroke="#ffffff" stroke-width="1.2" opacity="0.45" />
          <rect x="15" y="31" width="24" height="18" rx="2" fill="#0b1e3d" />
          <text x="27" y="41" font-family="'DM Sans',sans-serif" font-size="5.2" font-weight="700" fill="#f8fafc" text-anchor="middle" letter-spacing="0.6">POLICE</text>
          <rect x="14" y="32" width="26" height="4.5" rx="1.5" fill="#091427" stroke="#475569" stroke-width="0.8" />
          <rect x="15.5" y="33" width="11" height="2.5" rx="1" fill="#0066ff" class="${isOnTrip || isSiren ? 'strobe-blue' : ''}" />
          <rect x="27.5" y="33" width="11" height="2.5" rx="1" fill="#ff1a3c" class="${isOnTrip || isSiren ? 'strobe-red' : ''}" />
          <path d="M16 49 L38 49 L37 53 L17 53 Z" fill="#173154" opacity="0.9" />
          <path d="M14 53 L40 53 L39 57 L15 57 Z" fill="#132a4e" />
          <line x1="15" y1="56" x2="39" y2="56" stroke="#ef4444" stroke-width="1.5" />
        </svg>
      `;
    }

    const hudHtml = `
      <div class="veh-3d-hud-tag" style="transform: translateX(-50%) rotateZ(${-headingDeg}deg);">
        <span class="veh-3d-hud-dot ${isSiren ? 'siren' : (isOnTrip ? 'patrol' : 'standby')}"></span>
        <span>${veh.callSign || veh.registration}</span>
        ${veh.speed !== undefined ? `<span style="opacity:0.75;font-weight:400;margin-left:3px;">${veh.speed} km/h</span>` : ''}
      </div>
    `;

    const sirenWaveHtml = isSiren ? '<div class="veh-3d-siren-wave"></div>' : '';

    const iconHtml = `
      <div class="veh-3d-pin ${isSelected ? 'selected' : ''}" title="${veh.registration} - ${veh.callSign}">
        ${sirenWaveHtml}
        <div class="veh-3d-model" style="transform: rotateZ(${headingDeg}deg);">
          ${bodySvg}
          ${hudHtml}
        </div>
      </div>
    `;

    return window.L.divIcon({
      className: 'veh-3d-pin-container',
      html: iconHtml,
      iconSize: [54, 64],
      iconAnchor: [27, 32],
      popupAnchor: [0, -32]
    });
  }

  // Public FleetApp Namespace
  window.FleetApp = {
    showToast,
    openModal,
    closeModal,
    confirmModal,
    exportToCSV,
    downloadProjectZip,
    handleNotificationClick,
    updateDynamicBadges,
    get3DVehicleDivIcon
  };

})(window);
