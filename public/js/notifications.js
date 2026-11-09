/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * Notifications & Dispatch Alerts Controller
 */

(function (window) {
  'use strict';

  function initNotifications() {
    renderNotificationsList();
    setupFiltersAndActions();

    window.addEventListener('fleet_data_updated', renderNotificationsList);
  }

  function renderNotificationsList() {
    const container = document.getElementById('notifications-full-list');
    if (!container || !window.FleetStorage) return;

    const typeFilter = document.getElementById('notif-filter-type')?.value || 'ALL';
    let list = window.FleetStorage.getNotifications();

    if (typeFilter !== 'ALL') {
      list = list.filter(n => n.type === typeFilter);
    }

    const unreadCount = list.filter(n => !n.isRead).length;
    const badge = document.getElementById('notif-page-count');
    if (badge) {
      badge.textContent = `${unreadCount} unread / ${list.length} total`;
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3.5rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light); color: var(--text-muted);">
          <i class="fa-regular fa-bell-slash" style="font-size: 2.5rem; margin-bottom: 0.75rem; display: block; opacity: 0.3;"></i>
          No alert dispatches or notifications found.
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(n => {
      let icon = 'fa-info';
      let iconBg = '#eff6ff';
      let iconColor = '#1d4ed8';
      let badgeLabel = 'System Notice';

      if (n.type === 'alert') {
        icon = 'fa-triangle-exclamation';
        iconBg = '#fef2f2';
        iconColor = '#dc2626';
        badgeLabel = 'Emergency / Alert';
      } else if (n.type === 'assignment') {
        icon = 'fa-route';
        iconBg = '#f0fdf4';
        iconColor = '#16a34a';
        badgeLabel = 'Dispatch Assigned';
      } else if (n.type === 'maintenance') {
        icon = 'fa-wrench';
        iconBg = '#fffbeb';
        iconColor = '#d97706';
        badgeLabel = 'Maintenance';
      } else if (n.type === 'completed') {
        icon = 'fa-check-double';
        iconBg = '#f5f3ff';
        iconColor = '#7c3aed';
        badgeLabel = 'Shift Concluded';
      }

      return `
        <div class="content-card" style="padding: 1.15rem 1.4rem; border-left: 4px solid ${iconColor}; background: ${n.isRead ? 'var(--bg-card)' : 'rgba(29, 78, 216, 0.03)'}; transition: all 0.15s ease;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
            <div style="display: flex; gap: 1rem; align-items: flex-start; flex: 1;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: ${iconBg}; color: ${iconColor}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
                <i class="fa-solid ${icon}"></i>
              </div>
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2px; flex-wrap: wrap;">
                  <strong style="font-family: var(--font-heading); font-size: 0.95rem; color: var(--text-main);">${n.title}</strong>
                  <span style="font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; background: ${iconBg}; color: ${iconColor}; font-weight: 700; text-transform: uppercase;">
                    ${badgeLabel}
                  </span>
                  ${!n.isRead ? '<span style="font-size: 0.65rem; padding: 2px 6px; border-radius: 999px; background: #dc2626; color: #fff; font-weight: 700;">NEW</span>' : ''}
                </div>
                <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; margin-top: 4px;">
                  ${n.message}
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px; display: flex; align-items: center; gap: 0.4rem;">
                  <i class="fa-regular fa-clock"></i> Logged at ${n.timestamp}
                </div>
              </div>
            </div>

            <div class="table-actions">
              ${!n.isRead ? `
                <button class="btn btn-secondary btn-sm" onclick="NotificationsPage.markRead('${n.id}')" title="Mark as Read" style="font-size: 0.72rem; padding: 4px 10px;">
                  <i class="fa-solid fa-check"></i> Read
                </button>
              ` : ''}
              <button class="action-btn-sm delete" onclick="NotificationsPage.deleteNotif('${n.id}')" title="Delete Alert">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function setupFiltersAndActions() {
    const filterSelect = document.getElementById('notif-filter-type');
    if (filterSelect) filterSelect.addEventListener('change', renderNotificationsList);

    const markAllBtn = document.getElementById('btn-mark-all-read');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        window.FleetStorage.markAllNotificationsRead();
        window.FleetApp.showToast('Updated', 'All notifications marked as read.', 'success');
        renderNotificationsList();
      });
    }

    const clearAllBtn = document.getElementById('btn-clear-all-notifs');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        window.FleetApp.confirmModal(
          'Clear Notifications',
          'Are you sure you want to delete all alert records from the display queue?',
          () => {
            window.FleetStorage.clearAllNotifications();
            window.FleetApp.showToast('Cleared', 'All notifications removed.', 'warning');
            renderNotificationsList();
          }
        );
      });
    }

    const testAlertBtn = document.getElementById('btn-generate-test-alert');
    if (testAlertBtn) {
      testAlertBtn.addEventListener('click', () => {
        const testTypes = [
          {
            title: 'Pursuit Telemetry Alert',
            message: 'Highway Interceptor INT-8832 recorded rapid acceleration: 0-60 MPH in 4.2s responding to 10-33 Backup request.',
            type: 'alert'
          },
          {
            title: 'Shift Rotation Reminder',
            message: 'Evening Patrol Sector 3 shift change commences in 30 minutes. Relieving officers check in at armory.',
            type: 'update'
          },
          {
            title: 'Low Def Fluid / Fuel Alert',
            message: 'Prisoner Transport Van VAN-202 DEF tank level dropped below 15%. Scheduled for servicing.',
            type: 'maintenance'
          }
        ];
        const randomItem = testTypes[Math.floor(Math.random() * testTypes.length)];
        window.FleetStorage.addNotification(randomItem);
        window.FleetApp.showToast('New Alert Generated', randomItem.title, 'info');
        renderNotificationsList();
      });
    }
  }

  function markRead(id) {
    window.FleetStorage.markNotificationRead(id);
    renderNotificationsList();
  }

  function deleteNotif(id) {
    window.FleetStorage.deleteNotification(id);
    window.FleetApp.showToast('Removed', 'Notification deleted', 'info');
    renderNotificationsList();
  }

  document.addEventListener('DOMContentLoaded', initNotifications);

  window.NotificationsPage = {
    markRead,
    deleteNotif
  };

})(window);
