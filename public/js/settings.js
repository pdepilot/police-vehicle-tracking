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
          department: getVal('settings-department') || current.department,
          terminalId: getVal('settings-terminal-id') || current.terminalId,
          theme: theme,
          speedUnit: getVal('settings-speed-unit'),
          telemetryRefreshRate: Number(getVal('settings-refresh-rate')) || 5,
          audioAlerts: document.getElementById('settings-audio-alerts')?.checked,
          autoAssignTracking: document.getElementById('settings-auto-assign')?.checked
        };
        window.FleetStorage.saveSettings(updated);

        // Apply theme immediately
        document.documentElement.setAttribute('data-theme', theme);

        window.FleetApp.showToast('Preferences Saved', 'System and department preferences have been saved.', 'success');
      });
    }

    // Theme selector change
    const themeSelect = document.getElementById('settings-theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', function () {
        document.documentElement.setAttribute('data-theme', this.value);
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
