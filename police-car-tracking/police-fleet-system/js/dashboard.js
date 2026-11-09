/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * Dashboard Controller (Chart.js + Leaflet.js + Dynamic Counters)
 */

(function (window) {
  'use strict';

  let activityChartInstance = null;
  let statusChartInstance = null;
  let dashboardMapInstance = null;
  let mapMarkers = [];

  function initDashboard() {
    renderKPIStats();
    initCharts();
    initDashboardMap();
    renderRecentTrips();
    renderRecentAlerts();
    setupDashboardEventListeners();
  }

  // 1. Calculate & Render Statistics Cards
  function renderKPIStats() {
    if (!window.FleetStorage) return;

    const vehicles = window.FleetStorage.getVehicles();
    const trips = window.FleetStorage.getTrips();
    const maintenance = window.FleetStorage.getMaintenance();

    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
    const onTripVehicles = vehicles.filter(v => v.status === 'On Trip').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'Maintenance').length;
    const pendingTrips = trips.filter(t => t.status === 'Scheduled').length;
    const completedTrips = trips.filter(t => t.status === 'Completed').length;

    // Update DOM counters
    setElText('stat-total-vehicles', totalVehicles);
    setElText('stat-available-vehicles', availableVehicles);
    setElText('stat-ontrip-vehicles', onTripVehicles);
    setElText('stat-maintenance-vehicles', maintenanceVehicles);
    setElText('stat-pending-trips', pendingTrips);
    setElText('stat-completed-trips', completedTrips);

    // Fleet readiness calculation
    const readinessPct = totalVehicles > 0 ? Math.round((availableVehicles / totalVehicles) * 100) : 0;
    const readinessEl = document.getElementById('stat-readiness-percent');
    if (readinessEl) {
      readinessEl.textContent = `${readinessPct}% Operational Readiness`;
    }
  }

  function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // 2. Initialize Chart.js Analytics
  function initCharts() {
    // 24h Activity Line Chart
    const activityCanvas = document.getElementById('dashboard-activity-chart');
    if (activityCanvas && window.Chart) {
      const ctx = activityCanvas.getContext('2d');
      if (activityChartInstance) activityChartInstance.destroy();

      activityChartInstance = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
          datasets: [
            {
              label: 'Patrol & Intercept Dispatches',
              data: [8, 4, 11, 19, 24, 21, 26, 17],
              borderColor: '#1d4ed8',
              backgroundColor: 'rgba(29, 78, 216, 0.12)',
              fill: true,
              tension: 0.35,
              borderWidth: 2.5,
              pointBackgroundColor: '#1d4ed8',
              pointRadius: 4
            },
            {
              label: 'Emergency / Priority 1 Runs',
              data: [2, 1, 3, 6, 8, 5, 9, 4],
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              fill: true,
              tension: 0.35,
              borderWidth: 2,
              pointBackgroundColor: '#ef4444',
              pointRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                font: { family: 'Inter', size: 12 }
              }
            },
            tooltip: {
              backgroundColor: '#0f172a',
              titleFont: { family: 'Manrope', size: 12 },
              bodyFont: { family: 'Inter', size: 12 },
              padding: 10,
              cornerRadius: 6
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(226, 232, 240, 0.6)' },
              ticks: { font: { family: 'JetBrains Mono', size: 11 } }
            },
            x: {
              grid: { display: false },
              ticks: { font: { family: 'JetBrains Mono', size: 11 } }
            }
          }
        }
      });
    }

    // Fleet Status Doughnut Chart
    const statusCanvas = document.getElementById('dashboard-status-chart');
    if (statusCanvas && window.Chart) {
      const vehicles = window.FleetStorage.getVehicles();
      const avail = vehicles.filter(v => v.status === 'Available').length;
      const trip = vehicles.filter(v => v.status === 'On Trip').length;
      const mnt = vehicles.filter(v => v.status === 'Maintenance').length;
      const oos = vehicles.filter(v => v.status === 'Out of Service').length;

      const ctx = statusCanvas.getContext('2d');
      if (statusChartInstance) statusChartInstance.destroy();

      statusChartInstance = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Available', 'On Patrol / Trip', 'In Maintenance', 'Out of Service'],
          datasets: [{
            data: [avail, trip, mnt, oos],
            backgroundColor: ['#10b981', '#1d4ed8', '#f59e0b', '#ef4444'],
            hoverOffset: 4,
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 14,
                font: { family: 'Inter', size: 12 }
              }
            }
          }
        }
      });
    }
  }

  // 3. Interactive Leaflet Map for Dashboard
  function initDashboardMap() {
    const mapEl = document.getElementById('dashboard-mini-map');
    if (!mapEl || !window.L) return;

    if (dashboardMapInstance) {
      dashboardMapInstance.remove();
      dashboardMapInstance = null;
    }

    // Centered on Metro City (San Francisco coordinates for realistic street density)
    dashboardMapInstance = window.L.map('dashboard-mini-map', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([37.778, -122.418], 12);

    // High quality OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <strong>DEMO DATA</strong>',
      maxZoom: 18
    }).addTo(dashboardMapInstance);

    renderDashboardMapMarkers();
  }

  function renderDashboardMapMarkers() {
    if (!dashboardMapInstance || !window.FleetStorage || !window.L) return;

    // Clear old markers
    mapMarkers.forEach(m => dashboardMapInstance.removeLayer(m));
    mapMarkers = [];

    const vehicles = window.FleetStorage.getVehicles();

    vehicles.forEach(veh => {
      if (!veh.lat || !veh.lng) return;

      const isOnTrip = veh.status === 'On Trip';
      const isSiren = veh.sirenActive;

      let iconHtml = '<i class="fa-solid fa-car-side"></i>';
      if (veh.type === 'SUV') iconHtml = '<i class="fa-solid fa-truck-monster"></i>';
      else if (veh.type === 'Motorcycle') iconHtml = '<i class="fa-solid fa-motorcycle"></i>';
      else if (veh.type === 'Truck') iconHtml = '<i class="fa-solid fa-truck-pickup"></i>';
      else if (veh.type === 'Armored Tactical') iconHtml = '<i class="fa-solid fa-shield-halved"></i>';

      const customIcon = window.L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="vehicle-map-marker ${isOnTrip ? 'on-trip' : ''} ${isSiren ? 'siren-on' : ''}" title="${veh.registration} - ${veh.callSign}">
            ${iconHtml}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20]
      });

      const popupContent = `
        <div class="custom-leaflet-popup">
          <div class="popup-header">
            <strong>${veh.callSign}</strong>
            <span class="plate-badge" style="font-size: 0.68rem; padding: 1px 4px;">${veh.registration}</span>
          </div>
          <div class="popup-body">
            <div><strong>Model:</strong> ${veh.year} ${veh.make} ${veh.model}</div>
            <div><strong>Division:</strong> ${veh.department}</div>
            <div><strong>Assigned Officer:</strong> ${veh.assignedDriverName || 'None'}</div>
            <div><strong>Speed:</strong> <span style="font-family: var(--font-mono); font-weight: 700;">${veh.speed} MPH</span> (${veh.heading})</div>
            <div><strong>Status:</strong> <span class="status-pill status-${veh.status.toLowerCase().replace(/\s+/g, '')}"><span class="dot"></span> ${veh.status}</span></div>
            <div style="margin-top: 6px; text-align: right;">
              <a href="tracking.html?focus=${veh.id}" class="btn btn-primary btn-sm" style="font-size: 0.72rem; padding: 2px 8px;">
                <i class="fa-solid fa-location-crosshairs"></i> Live Track
              </a>
            </div>
          </div>
        </div>
      `;

      const marker = window.L.marker([veh.lat, veh.lng], { icon: customIcon })
        .addTo(dashboardMapInstance)
        .bindPopup(popupContent);

      mapMarkers.push(marker);
    });
  }

  // 4. Render Recent Dispatches Table
  function renderRecentTrips() {
    const tableBody = document.getElementById('dashboard-recent-trips-tbody');
    if (!tableBody || !window.FleetStorage) return;

    const trips = window.FleetStorage.getTrips().slice(0, 5);

    if (trips.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No trip records logged yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = trips.map(t => {
      let statusClass = 'status-available';
      if (t.status === 'Active') statusClass = 'status-ontrip';
      else if (t.status === 'Scheduled') statusClass = 'status-maintenance';
      else if (t.status === 'Completed') statusClass = 'status-available';

      return `
        <tr>
          <td>
            <span style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${t.id}</span>
          </td>
          <td>
            <span class="plate-badge"><i class="fa-solid fa-shield"></i> ${t.vehicleReg}</span>
          </td>
          <td>
            <strong>${t.driverName}</strong>
          </td>
          <td>
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 500;">${t.destination}</span>
              <span style="font-size: 0.7rem; color: var(--text-muted);"><i class="fa-solid fa-location-arrow"></i> From: ${t.origin}</span>
            </div>
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-size: 0.75rem;">${t.departureDate} ${t.departureTime}</span>
          </td>
          <td>
            <span class="status-pill ${statusClass}">
              <span class="dot"></span> ${t.status}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <a href="trips.html" class="action-btn-sm" title="View in Dispatches">
                <i class="fa-regular fa-eye"></i>
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 5. Render Recent Alerts & Maintenance Reminders
  function renderRecentAlerts() {
    const alertsContainer = document.getElementById('dashboard-alerts-list');
    if (!alertsContainer || !window.FleetStorage) return;

    const notifications = window.FleetStorage.getNotifications().slice(0, 4);
    const maintenance = window.FleetStorage.getMaintenance().filter(m => m.status === 'In Progress' || m.status === 'Pending').slice(0, 2);

    let html = '';

    // Show ongoing maintenance first
    maintenance.forEach(m => {
      html += `
        <div style="padding: 0.85rem; border-radius: var(--radius-md); background: #fffbeb; border: 1px solid #fde68a; display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.65rem;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #f59e0b; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="fa-solid fa-wrench"></i>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 0.82rem; color: #92400e; display: flex; justify-content: space-between;">
              <span>Service In Progress: ${m.vehicleReg}</span>
              <span class="status-pill status-maintenance" style="padding: 1px 6px; font-size: 0.65rem;">${m.status}</span>
            </div>
            <div style="font-size: 0.75rem; color: #78350f; margin-top: 2px;">${m.type} &bull; Next due: ${m.nextServiceDate}</div>
          </div>
        </div>
      `;
    });

    notifications.forEach(n => {
      let icon = 'fa-bell';
      let iconBg = '#eff6ff';
      let iconColor = '#1d4ed8';

      if (n.type === 'alert') {
        icon = 'fa-triangle-exclamation';
        iconBg = '#fef2f2';
        iconColor = '#dc2626';
      } else if (n.type === 'completed') {
        icon = 'fa-circle-check';
        iconBg = '#ecfdf5';
        iconColor = '#059669';
      }

      html += `
        <div style="padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); background: var(--bg-card); display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.5rem;">
          <div style="width: 30px; height: 30px; border-radius: 50%; background: ${iconBg}; color: ${iconColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.8rem;">
            <i class="fa-solid ${icon}"></i>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-main);">${n.title}</div>
            <div style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 1px;">${n.message}</div>
            <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 3px;"><i class="fa-regular fa-clock"></i> ${n.timestamp}</div>
          </div>
        </div>
      `;
    });

    alertsContainer.innerHTML = html;
  }

  // 6. Quick Action Buttons Handlers
  function setupDashboardEventListeners() {
    // Quick Add Vehicle Button
    const btnAddVeh = document.getElementById('dash-quick-add-vehicle');
    if (btnAddVeh) {
      btnAddVeh.addEventListener('click', () => {
        window.location.href = 'vehicles.html?action=add';
      });
    }

    // Quick Add Driver Button
    const btnAddDrv = document.getElementById('dash-quick-add-driver');
    if (btnAddDrv) {
      btnAddDrv.addEventListener('click', () => {
        window.location.href = 'drivers.html?action=add';
      });
    }

    // Quick Assign Trip
    const btnAssignTrip = document.getElementById('dash-quick-assign-trip');
    if (btnAssignTrip) {
      btnAssignTrip.addEventListener('click', () => {
        window.location.href = 'trips.html';
      });
    }

    // Quick View Tracking
    const btnViewTrack = document.getElementById('dash-quick-view-tracking');
    if (btnViewTrack) {
      btnViewTrack.addEventListener('click', () => {
        window.location.href = 'tracking.html';
      });
    }

    // Quick Add Maintenance
    const btnAddMnt = document.getElementById('dash-quick-add-maintenance');
    if (btnAddMnt) {
      btnAddMnt.addEventListener('click', () => {
        window.location.href = 'maintenance.html?action=add';
      });
    }

    // Quick Generate Report
    const btnGenRep = document.getElementById('dash-quick-generate-report');
    if (btnGenRep) {
      btnGenRep.addEventListener('click', () => {
        window.location.href = 'reports.html';
      });
    }

    // Refresh data listener
    window.addEventListener('fleet_data_updated', () => {
      renderKPIStats();
      initCharts();
      renderRecentTrips();
      renderRecentAlerts();
      renderDashboardMapMarkers();
    });
  }

  document.addEventListener('DOMContentLoaded', initDashboard);

})(window);
