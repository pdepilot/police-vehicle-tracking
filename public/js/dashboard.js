/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * Dashboard Controller (Chart.js + Leaflet.js + Dynamic Counters)
 * Styled & Integrated with TravelBooking Design System
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

    // Also update nav badges if elements exist
    setElText('badgeVehicles', totalVehicles);

    // Fleet readiness calculation
    const readinessPct = totalVehicles > 0 ? Math.round((availableVehicles / totalVehicles) * 100) : 0;
    const readinessEl = document.getElementById('stat-readiness-percent');
    if (readinessEl) {
      readinessEl.textContent = `${readinessPct}% Readiness`;
    }
  }

  function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // 2. Initialize Chart.js Analytics (TravelBooking Palette & Clean Styling)
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
              borderColor: '#0b1e3d', // TravelBooking --navy
              backgroundColor: 'rgba(11, 30, 61, 0.08)',
              fill: true,
              tension: 0.35,
              borderWidth: 2,
              pointBackgroundColor: '#0b1e3d',
              pointBorderColor: '#fdfbf6',
              pointBorderWidth: 1.5,
              pointRadius: 4
            },
            {
              label: 'Emergency / Priority 1 Runs',
              data: [2, 1, 3, 6, 8, 5, 9, 4],
              borderColor: '#a3452e', // TravelBooking --error
              backgroundColor: 'rgba(163, 69, 46, 0.06)',
              fill: true,
              tension: 0.35,
              borderWidth: 1.8,
              pointBackgroundColor: '#a3452e',
              pointBorderColor: '#fdfbf6',
              pointBorderWidth: 1.5,
              pointRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false // Using custom TravelBooking legend above canvas
            },
            tooltip: {
              backgroundColor: '#0b1e3d',
              titleColor: '#e8d9b3',
              bodyColor: '#fdfbf6',
              borderColor: '#a8842c',
              borderWidth: 1,
              titleFont: { family: 'Cormorant Garamond', size: 14, weight: 600 },
              bodyFont: { family: 'DM Sans', size: 12 },
              padding: 12,
              cornerRadius: 0
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(217, 209, 192, 0.4)' },
              ticks: {
                font: { family: 'DM Sans', size: 11 },
                color: '#8a8378'
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                font: { family: 'DM Sans', size: 11 },
                color: '#8a8378'
              }
            }
          }
        }
      });
    }

    // Fleet Status Doughnut Chart
    const statusCanvas = document.getElementById('dashboard-status-chart');
    if (statusCanvas && window.Chart) {
      const vehicles = window.FleetStorage ? window.FleetStorage.getVehicles() : [];
      const avail = vehicles.filter(v => v.status === 'Available').length;
      const trip = vehicles.filter(v => v.status === 'On Trip').length;
      const mnt = vehicles.filter(v => v.status === 'Maintenance').length;
      const oos = vehicles.filter(v => v.status === 'Out of Service').length;

      const ctx = statusCanvas.getContext('2d');
      if (statusChartInstance) statusChartInstance.destroy();

      statusChartInstance = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Available', 'On Patrol', 'In Maintenance', 'Out of Service'],
          datasets: [{
            data: [avail, trip, mnt, oos],
            backgroundColor: [
              '#2e7d5b', // TravelBooking --green
              '#0b1e3d', // TravelBooking --navy
              '#a8842c', // TravelBooking --gold
              '#a3452e'  // TravelBooking --error
            ],
            hoverOffset: 6,
            borderWidth: 2,
            borderColor: '#fdfbf6'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              display: false // Using custom TravelBooking legend
            },
            tooltip: {
              backgroundColor: '#0b1e3d',
              titleColor: '#e8d9b3',
              bodyColor: '#fdfbf6',
              borderColor: '#a8842c',
              borderWidth: 1,
              titleFont: { family: 'Cormorant Garamond', size: 14, weight: 600 },
              bodyFont: { family: 'DM Sans', size: 12 },
              padding: 10,
              cornerRadius: 0
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

    const vehicles = window.FleetStorage ? window.FleetStorage.getVehicles() : [];

    const firstLocatedVehicle = vehicles.find(veh =>
      Number.isFinite(veh.lat) &&
      Number.isFinite(veh.lng) &&
      veh.lat >= -90 &&
      veh.lat <= 90 &&
      veh.lng >= -180 &&
      veh.lng <= 180
    );

    const initialLat = firstLocatedVehicle ? firstLocatedVehicle.lat : 5.48;
    const initialLng = firstLocatedVehicle ? firstLocatedVehicle.lng : 7.03;

    // Default map centre: Owerri, Imo State.
    // This is a map display centre, not a vehicle GPS position.
    dashboardMapInstance = window.L.map('dashboard-mini-map', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([initialLat, initialLng], 12);

    // OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <strong>DEMO DATA</strong>',
      maxZoom: 18
    }).addTo(dashboardMapInstance);

    setTimeout(() => {
      if (dashboardMapInstance) dashboardMapInstance.invalidateSize();
    }, 200);

    renderDashboardMapMarkers();
  }

  function renderDashboardMapMarkers() {
    if (!dashboardMapInstance || !window.FleetStorage || !window.L) return;

    // Clear old markers
    mapMarkers.forEach(m => dashboardMapInstance.removeLayer(m));
    mapMarkers = [];

    const vehicles = window.FleetStorage.getVehicles();

    vehicles.forEach(veh => {
      if (
        !Number.isFinite(veh.lat) ||
        !Number.isFinite(veh.lng) ||
        veh.lat < -90 ||
        veh.lat > 90 ||
        veh.lng < -180 ||
        veh.lng > 180
      ) return;

      const isOnTrip = veh.status === 'On Trip';
      const isSiren = Boolean(veh.sirenActive);

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
            <span class="plate-badge">${veh.registration}</span>
          </div>
          <div class="popup-body">
            <div><strong>Model:</strong> ${veh.year} ${veh.make} ${veh.model} (${veh.type})</div>
            <div><strong>Division:</strong> ${veh.department}</div>
            <div><strong>Assigned Officer:</strong> ${veh.assignedDriverName || 'None'}</div>
            <div><strong>Speed:</strong> <span class="cell-mono">${veh.speed} KM/H</span> (${veh.heading})</div>
            <div style="margin-top: 4px;">
              <span class="status-pill status-${veh.status.toLowerCase().replace(/\s+/g, '')}"><span class="dot"></span> ${veh.status}</span>
            </div>
            <div style="margin-top: 8px; text-align: right;">
              <a href="/tracking?focus=${veh.id}" class="btn btn-navy btn-xs">
                <i class="bi bi-crosshair"></i> Live Radar Track
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

  // 4. Render Recent Dispatches Table (TravelBooking .table-clean styling)
  function renderRecentTrips() {
    const tableBody = document.getElementById('dashboard-recent-trips-tbody');
    if (!tableBody || !window.FleetStorage) return;

    const trips = window.FleetStorage.getTrips().slice(0, 5);

    if (trips.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No dispatch records logged yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = trips.map(t => {
      let statusClass = 'status-available';
      if (t.status === 'Active') statusClass = 'status-ontrip';
      else if (t.status === 'Scheduled') statusClass = 'status-maintenance';
      else if (t.status === 'Completed') statusClass = 'status-available';

      return `
        <tr>
          <td data-label="Trip ID">
            <strong class="cell-strong">${t.id}</strong>
          </td>
          <td data-label="Vehicle">
            <span class="plate-badge"><i class="bi bi-shield-shaded"></i> ${t.vehicleReg}</span>
          </td>
          <td data-label="Driver">
            <span class="cell-strong">${t.driverName}</span>
          </td>
          <td data-label="Destination">
            <div>
              <span class="cell-strong">${t.destination}</span>
              <span class="cell-sub"><i class="bi bi-geo-alt"></i> Origin: ${t.origin}</span>
            </div>
          </td>
          <td data-label="Departure">
            <span class="cell-mono">${t.departureDate} ${t.departureTime}</span>
          </td>
          <td data-label="Status">
            <span class="status-pill ${statusClass}">
              <span class="dot"></span> ${t.status}
            </span>
          </td>
          <td class="text-end" data-label="Action">
            <a href="/trips" class="btn btn-ghost btn-xs" title="View details">
              <i class="bi bi-eye"></i> View
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 5. Render Recent Alerts & Maintenance Reminders (TravelBooking .activity-list styling)
  function renderRecentAlerts() {
    const alertsContainer = document.getElementById('dashboard-alerts-list');
    if (!alertsContainer || !window.FleetStorage) return;

    const notifications = window.FleetStorage.getNotifications().slice(0, 4);
    const maintenance = window.FleetStorage.getMaintenance().filter(m => m.status === 'In Progress' || m.status === 'Pending').slice(0, 2);

    let html = '';

    // Show ongoing maintenance first
    maintenance.forEach(m => {
      html += `
        <li class="activity-item">
          <span class="activity-icon gold">
            <i class="bi bi-wrench-adjustable"></i>
          </span>
          <div class="activity-body">
            <strong>Workshop Service: ${m.vehicleReg}</strong>
            <span>${m.type} &bull; Next due: ${m.nextServiceDate}</span>
          </div>
          <span class="activity-time">${m.status}</span>
        </li>
      `;
    });

    notifications.forEach(n => {
      let icon = 'bi-bell-fill';
      let iconClass = 'violet';

      if (n.type === 'alert') {
        icon = 'bi-exclamation-triangle-fill';
        iconClass = 'gold';
      } else if (n.type === 'completed') {
        icon = 'bi-check-circle-fill';
        iconClass = 'green';
      }

      html += `
        <li class="activity-item">
          <span class="activity-icon ${iconClass}">
            <i class="bi ${icon}"></i>
          </span>
          <div class="activity-body">
            <strong>${n.title}</strong>
            <span>${n.message}</span>
          </div>
          <span class="activity-time">${n.timestamp}</span>
        </li>
      `;
    });

    if (!html) {
      html = '<li class="text-muted p-3" style="font-size:13px;list-style:none;">No active alerts recorded.</li>';
    }

    alertsContainer.innerHTML = html;
  }

  // 6. Quick Action Buttons Handlers & Live Poll
  function setupDashboardEventListeners() {
    // Refresh dashboard from the authenticated MySQL backend
    const btnRefresh = document.getElementById('btnRefreshLive');

    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        if (!window.FleetStorage || typeof window.FleetStorage.syncFromBackend !== 'function') {
          console.error('FleetStorage synchronization is unavailable.');
          return;
        }

        const refreshIcon = document.getElementById('refreshIcon');
        const timestampEl = document.getElementById('liveTimestamp');
        const originalLabel = btnRefresh.innerHTML;

        btnRefresh.disabled = true;
        btnRefresh.innerHTML = '<i class="bi bi-arrow-clockwise spin-icon"></i> Syncing...';

        if (refreshIcon) {
          refreshIcon.classList.add('spin-icon');
        }

        if (timestampEl) {
          timestampEl.textContent = 'Synchronizing...';
        }

        window.FleetStorage.syncFromBackend()
          .then((synced) => {
            if (synced) {
              if (timestampEl) {
                timestampEl.textContent = new Date().toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                });
              }
            } else if (timestampEl) {
              timestampEl.textContent = 'Synchronization failed';
            }
          })
          .catch((error) => {
            console.error('Dashboard synchronization error:', error);

            if (timestampEl) {
              timestampEl.textContent = 'Synchronization failed';
            }
          })
          .finally(() => {
            btnRefresh.disabled = false;
            btnRefresh.innerHTML = originalLabel;

            if (refreshIcon) {
              refreshIcon.classList.remove('spin-icon');
            }
          });
      });
    }

    // Quick Add Vehicle Button
    const btnAddVeh = document.getElementById('dash-quick-add-vehicle');
    if (btnAddVeh) {
      btnAddVeh.addEventListener('click', () => {
        window.location.href = '/vehicles?action=add';
      });
    }

    // Quick Add Driver Button
    const btnAddDrv = document.getElementById('dash-quick-add-driver');
    if (btnAddDrv) {
      btnAddDrv.addEventListener('click', () => {
        window.location.href = '/drivers?action=add';
      });
    }

    // Quick Assign Trip
    const btnAssignTrip = document.getElementById('dash-quick-assign-trip');
    if (btnAssignTrip) {
      btnAssignTrip.addEventListener('click', () => {
        window.location.href = '/trips';
      });
    }
    const btnAssignTrip2 = document.getElementById('dash-quick-assign-trip-btn');
    if (btnAssignTrip2) {
      btnAssignTrip2.addEventListener('click', () => {
        window.location.href = '/trips';
      });
    }

    // Quick View Tracking
    const btnViewTrack = document.getElementById('dash-quick-view-tracking');
    if (btnViewTrack) {
      btnViewTrack.addEventListener('click', () => {
        window.location.href = '/tracking';
      });
    }

    // Quick Add Maintenance
    const btnAddMnt = document.getElementById('dash-quick-add-maintenance');
    if (btnAddMnt) {
      btnAddMnt.addEventListener('click', () => {
        window.location.href = '/maintenance?action=add';
      });
    }

    // Quick Generate Report
    const btnGenRep = document.getElementById('dash-quick-generate-report');
    if (btnGenRep) {
      btnGenRep.addEventListener('click', () => {
        window.location.href = '/reports';
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
