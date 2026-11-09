/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * System & Terminal Settings Controller
 */

(function (window) {
  'use strict';

  function initSettings() {
    loadSettingsIntoForm();
    setupSettingsForms();
    calculateStorageUsage();
  }

  function loadSettingsIntoForm() {
    if (!window.FleetStorage) return;
    const s = window.FleetStorage.getSettings();

    setVal('settings-commander-name', s.commanderName);
    setVal('settings-commander-badge', s.commanderBadge);
    setVal('settings-commander-email', s.commanderEmail);
    setVal('settings-department', s.department);
    setVal('settings-terminal-id', s.terminalId);
    setVal('settings-theme-select', s.theme || 'light');
    setVal('settings-speed-unit', s.speedUnit || 'MPH');
    setVal('settings-refresh-rate', s.telemetryRefreshRate || 5);

    const audioToggle = document.getElementById('settings-audio-alerts');
    if (audioToggle) audioToggle.checked = !!s.audioAlerts;

    const autoAssignToggle = document.getElementById('settings-auto-assign');
    if (autoAssignToggle) autoAssignToggle.checked = !!s.autoAssignTracking;
  }

  function setupSettingsForms() {
    // Save Profile Form
    const profileForm = document.getElementById('settings-profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const current = window.FleetStorage.getSettings();
        const updated = {
          ...current,
          commanderName: getVal('settings-commander-name'),
          commanderBadge: getVal('settings-commander-badge'),
          commanderEmail: getVal('settings-commander-email'),
          department: getVal('settings-department'),
          terminalId: getVal('settings-terminal-id')
        };
        window.FleetStorage.saveSettings(updated);
        window.FleetApp.showToast('Profile Saved', 'Fleet administrator profile updated successfully.', 'success');
      });
    }

    // Save System Preferences Form
    const systemForm = document.getElementById('settings-system-form');
    if (systemForm) {
      systemForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const current = window.FleetStorage.getSettings();
        const theme = getVal('settings-theme-select');
        const updated = {
          ...current,
          theme: theme,
          speedUnit: getVal('settings-speed-unit'),
          telemetryRefreshRate: Number(getVal('settings-refresh-rate')) || 5,
          audioAlerts: document.getElementById('settings-audio-alerts')?.checked,
          autoAssignTracking: document.getElementById('settings-auto-assign')?.checked
        };
        window.FleetStorage.saveSettings(updated);

        // Apply theme immediately
        document.documentElement.setAttribute('data-theme', theme);

        window.FleetApp.showToast('Preferences Saved', 'System preferences have been saved.', 'success');
      });
    }

    // Theme selector change
    const themeSelect = document.getElementById('settings-theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', function () {
        document.documentElement.setAttribute('data-theme', this.value);
      });
    }

    // Reset Demo Data
    const resetBtn = document.getElementById('btn-reset-demo-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        window.FleetApp.confirmModal(
          'Reset Demonstration Data',
          'This will purge all custom changes and restore all vehicles, officers, trips, and maintenance logs back to factory demonstration seeds. Continue?',
          () => {
            window.FleetStorage.resetAllToDefault();
            loadSettingsIntoForm();
            calculateStorageUsage();
            window.FleetApp.showToast('Factory Reset', 'Demonstration dataset restored to factory defaults.', 'success');
          }
        );
      });
    }

    // Export Entire Database as JSON
    const exportJsonBtn = document.getElementById('btn-export-db-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        const fullBackup = {
          system: 'Sentinel Police Fleet Management System',
          exportTimestamp: new Date().toISOString(),
          vehicles: window.FleetStorage.getVehicles(),
          drivers: window.FleetStorage.getDrivers(),
          trips: window.FleetStorage.getTrips(),
          maintenance: window.FleetStorage.getMaintenance(),
          fuel: window.FleetStorage.getFuel(),
          notifications: window.FleetStorage.getNotifications(),
          settings: window.FleetStorage.getSettings()
        };

        const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `police_fleet_backup_${new Date().toISOString().substring(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.FleetApp.showToast('Backup Exported', 'Full JSON database export downloaded.', 'success');
      });
    }
  }

  function calculateStorageUsage() {
    let totalBytes = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalBytes += (localStorage[key].length + key.length) * 2;
      }
    }
    const kb = (totalBytes / 1024).toFixed(2);
    const storageEl = document.getElementById('settings-storage-used');
    if (storageEl) {
      storageEl.textContent = `${kb} KB of LocalStorage consumed`;
    }
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  document.addEventListener('DOMContentLoaded', initSettings);

})(window);
