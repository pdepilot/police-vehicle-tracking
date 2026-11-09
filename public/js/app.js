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

  // Highlight Active Link in Sidebar
  function highlightActiveSidebar() {
    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || (currentPath === '' && href === 'dashboard.html'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
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

    if (window.FleetStorage) {
      const sess = window.FleetStorage.getAuthSession();
      if (sess && sess.user) {
        const nameEl = userBtn.querySelector('.user-name');
        const roleEl = userBtn.querySelector('.user-role');
        const avatarEl = userBtn.querySelector('.user-avatar');
        if (nameEl && sess.user.name) nameEl.textContent = sess.user.name;
        if (roleEl) roleEl.textContent = 'Nigeria Police Force';
        if (avatarEl) avatarEl.textContent = 'NPF';
      }
    }

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

  // Public FleetApp Namespace
  window.FleetApp = {
    showToast,
    openModal,
    closeModal,
    confirmModal,
    exportToCSV,
    downloadProjectZip,
    handleNotificationClick,
    updateDynamicBadges
  };

})(window);
