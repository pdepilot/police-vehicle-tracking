/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * Live Vehicle Tracking & Simulated Telematics (Leaflet.js + OpenStreetMap)
 */

(function (window) {
  'use strict';

  let trackingMap = null;
  let vehicleMarkers = {};
  let selectedVehicleId = null;
  let simulationInterval = null;
  let isSimulating = true;

  function initTracking() {
    initLeafletMap();
    renderVehicleList();
    setupEventListeners();
    checkUrlFocus();

    // Start subtle realistic demo telematics simulation
    startTelemetrySimulation();

    window.addEventListener('fleet_data_updated', () => {
      renderVehicleList();
      updateMapMarkers();
    });
  }

  // 1. Initialize Leaflet Map
  function initLeafletMap() {
    const mapContainer = document.getElementById('tracking-full-map');
    if (!mapContainer || !window.L) return;

    trackingMap = window.L.map('tracking-full-map', {
      zoomControl: true,
      minZoom: 11,
      maxZoom: 18
    }).setView([37.778, -122.418], 13);

    // OpenStreetMap CartoDB Positron / OSM Layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <span style="color: #b45309; font-weight: 700;">DEMO SIMULATED TELEMETRY</span>',
      maxZoom: 19
    }).addTo(trackingMap);

    updateMapMarkers();
  }

  // 2. Update Map Markers
  function updateMapMarkers() {
    if (!trackingMap || !window.FleetStorage || !window.L) return;

    const vehicles = window.FleetStorage.getVehicles();

    vehicles.forEach(veh => {
      if (!veh.lat || !veh.lng) return;

      const isOnTrip = veh.status === 'On Trip';
      const isSiren = veh.sirenActive;
      const isSelected = selectedVehicleId === veh.id;

      let iconHtml = '<i class="fa-solid fa-car-side"></i>';
      if (veh.type === 'SUV') iconHtml = '<i class="fa-solid fa-truck-monster"></i>';
      else if (veh.type === 'Motorcycle') iconHtml = '<i class="fa-solid fa-motorcycle"></i>';
      else if (veh.type === 'Truck') iconHtml = '<i class="fa-solid fa-truck-pickup"></i>';
      else if (veh.type === 'Armored Tactical') iconHtml = '<i class="fa-solid fa-shield-halved"></i>';

      const customIcon = window.L.divIcon({
        className: 'custom-tracking-marker',
        html: `
          <div class="vehicle-map-marker ${isOnTrip ? 'on-trip' : ''} ${isSiren ? 'siren-on' : ''} ${isSelected ? 'selected' : ''}" style="${isSelected ? 'transform: scale(1.25); border-color: #f59e0b; box-shadow: 0 0 15px #f59e0b;' : ''}">
            ${iconHtml}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -22]
      });

      if (vehicleMarkers[veh.id]) {
        // Smoothly animate marker to new coordinates
        vehicleMarkers[veh.id].setLatLng([veh.lat, veh.lng]);
        vehicleMarkers[veh.id].setIcon(customIcon);
      } else {
        const marker = window.L.marker([veh.lat, veh.lng], { icon: customIcon })
          .addTo(trackingMap)
          .on('click', () => {
            selectVehicle(veh.id);
          });

        vehicleMarkers[veh.id] = marker;
      }
    });
  }

  // 3. Render Tracking Sidebar Vehicle List
  function renderVehicleList() {
    const listContainer = document.getElementById('tracking-vehicle-list');
    if (!listContainer || !window.FleetStorage) return;

    const searchTerm = (document.getElementById('track-search-input')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('track-filter-status')?.value || 'ALL';

    let list = window.FleetStorage.getVehicles();

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'SIREN') {
        list = list.filter(v => v.sirenActive);
      } else {
        list = list.filter(v => v.status === statusFilter);
      }
    }

    if (searchTerm) {
      list = list.filter(v => {
        return (
          v.registration.toLowerCase().includes(searchTerm) ||
          v.callSign.toLowerCase().includes(searchTerm) ||
          v.model.toLowerCase().includes(searchTerm) ||
          (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(searchTerm))
        );
      });
    }

    const counter = document.getElementById('track-list-count');
    if (counter) counter.textContent = `${list.length} units`;

    if (list.length === 0) {
      listContainer.innerHTML = `
        <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
          No tracking units match criteria.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = list.map(v => {
      const isSelected = selectedVehicleId === v.id;
      let statusClass = 'status-available';
      if (v.status === 'On Trip') statusClass = 'status-ontrip';
      else if (v.status === 'Maintenance') statusClass = 'status-maintenance';
      else if (v.status === 'Out of Service') statusClass = 'status-outofservice';

      return `
        <div class="tracking-item-card ${isSelected ? 'active' : ''}" onclick="TrackingPage.selectVehicle('${v.id}')" style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-light); cursor: pointer; transition: background 0.15s ease; background: ${isSelected ? 'var(--primary-light)' : 'transparent'};">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span class="plate-badge" style="font-size: 0.72rem; padding: 1px 5px;">${v.registration}</span>
              <strong style="font-size: 0.82rem; color: var(--text-main);">${v.callSign}</strong>
            </div>
            <span class="status-pill ${statusClass}" style="font-size: 0.65rem; padding: 1px 6px;">
              <span class="dot"></span> ${v.status}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.73rem; color: var(--text-muted);">
            <span>${v.make} ${v.model}</span>
            <span style="font-family: var(--font-mono); font-weight: 600; color: ${v.speed > 0 ? 'var(--primary)' : 'var(--text-muted)'};">
              <i class="fa-solid fa-gauge-high"></i> ${v.speed} MPH
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; font-size: 0.7rem; color: var(--text-secondary);">
            <span><i class="fa-solid fa-user-shield"></i> ${v.assignedDriverName || 'Unassigned'}</span>
            ${v.sirenActive ? `<span style="color: #dc2626; font-weight: 700; font-size: 0.65rem; letter-spacing: 0.5px;"><i class="fa-solid fa-lightbulb"></i> SIREN ON</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. Select Vehicle & Open Live Telemetry Panel
  function selectVehicle(id) {
    selectedVehicleId = id;
    const veh = window.FleetStorage.getVehicleById(id);
    if (!veh) return;

    // Pan map to vehicle
    if (trackingMap && veh.lat && veh.lng) {
      trackingMap.flyTo([veh.lat, veh.lng], 15, {
        animate: true,
        duration: 1.2
      });
    }

    renderVehicleList();
    updateMapMarkers();
    renderTelemetryDrawer(veh);
  }

  // 5. Render Detail Drawer / Panel
  function renderTelemetryDrawer(veh) {
    const drawer = document.getElementById('tracking-telemetry-drawer');
    if (!drawer) return;

    drawer.style.display = 'flex';

    setElText('drawer-veh-reg', veh.registration);
    setElText('drawer-veh-callsign', veh.callSign);
    setElText('drawer-veh-makemodel', `${veh.year} ${veh.make} ${veh.model}`);
    setElText('drawer-veh-dept', veh.department);
    setElText('drawer-veh-driver', veh.assignedDriverName || 'Unassigned');
    setElText('drawer-veh-speed', `${veh.speed} MPH`);
    setElText('drawer-veh-heading', veh.heading || 'N');
    setElText('drawer-veh-coords', `${veh.lat.toFixed(4)}, ${veh.lng.toFixed(4)}`);
    setElText('drawer-veh-location', veh.lastLocation || 'Central Sector');
    setElText('drawer-veh-fuel', `${veh.fuelLevel}%`);
    setElText('drawer-veh-battery', `${veh.batteryLevel || 98}%`);
    setElText('drawer-veh-mileage', `${Number(veh.mileage).toLocaleString()} mi`);

    const sirenBtn = document.getElementById('btn-toggle-siren');
    if (sirenBtn) {
      sirenBtn.innerHTML = veh.sirenActive
        ? `<i class="fa-solid fa-volume-xmark"></i> Deactivate Siren`
        : `<i class="fa-solid fa-bullhorn"></i> Activate Emergency Siren`;
      sirenBtn.className = veh.sirenActive ? 'btn btn-danger btn-sm' : 'btn btn-secondary btn-sm';
    }

    const statusPill = document.getElementById('drawer-status-pill');
    if (statusPill) {
      let statusClass = 'status-available';
      if (veh.status === 'On Trip') statusClass = 'status-ontrip';
      else if (veh.status === 'Maintenance') statusClass = 'status-maintenance';
      statusPill.className = `status-pill ${statusClass}`;
      statusPill.innerHTML = `<span class="dot"></span> ${veh.status}`;
    }
  }

  // 6. Real-time Telemetry Movement Simulation (DEMO DATA)
  function startTelemetrySimulation() {
    if (simulationInterval) clearInterval(simulationInterval);

    simulationInterval = setInterval(() => {
      if (!isSimulating || !window.FleetStorage) return;

      const vehicles = window.FleetStorage.getVehicles();
      let updatedAny = false;

      vehicles.forEach(veh => {
        // Only move vehicles currently marked 'On Trip' or with active speed
        if (veh.status === 'On Trip' || veh.speed > 0) {
          // Slight realistic drift along streets (0.0003 deg ~ 30 meters)
          const angle = Math.random() * Math.PI * 2;
          const deltaLat = Math.sin(angle) * 0.00035;
          const deltaLng = Math.cos(angle) * 0.00035;

          veh.lat = Number((veh.lat + deltaLat).toFixed(5));
          veh.lng = Number((veh.lng + deltaLng).toFixed(5));

          // Fluctuate speed slightly
          const speedVariance = (Math.random() - 0.5) * 6;
          veh.speed = Math.max(15, Math.min(65, Math.round(veh.speed + speedVariance)));

          updatedAny = true;
        }
      });

      if (updatedAny) {
        window.FleetStorage.saveVehicles(vehicles);
        updateMapMarkers();

        // If currently viewing a vehicle in drawer, update speed and coords
        if (selectedVehicleId) {
          const cur = vehicles.find(v => v.id === selectedVehicleId);
          if (cur) {
            setElText('drawer-veh-speed', `${cur.speed} MPH`);
            setElText('drawer-veh-coords', `${cur.lat.toFixed(4)}, ${cur.lng.toFixed(4)}`);
          }
        }
      }
    }, 4000);
  }

  // 7. Setup Event Listeners
  function setupEventListeners() {
    const searchInput = document.getElementById('track-search-input');
    const statusSelect = document.getElementById('track-filter-status');

    if (searchInput) searchInput.addEventListener('input', renderVehicleList);
    if (statusSelect) statusSelect.addEventListener('change', renderVehicleList);

    // Toggle simulation button
    const btnSim = document.getElementById('btn-toggle-simulation');
    if (btnSim) {
      btnSim.addEventListener('click', () => {
        isSimulating = !isSimulating;
        btnSim.innerHTML = isSimulating
          ? `<i class="fa-solid fa-pause"></i> Pause Telemetry`
          : `<i class="fa-solid fa-play"></i> Resume Telemetry`;
        window.FleetApp.showToast(
          'Telemetry Simulation',
          isSimulating ? 'Simulated GPS feed resumed.' : 'Simulated GPS feed paused.',
          'info'
        );
      });
    }

    // Toggle Siren
    const sirenBtn = document.getElementById('btn-toggle-siren');
    if (sirenBtn) {
      sirenBtn.addEventListener('click', () => {
        if (!selectedVehicleId) return;
        const veh = window.FleetStorage.getVehicleById(selectedVehicleId);
        if (!veh) return;

        const newSiren = !veh.sirenActive;
        window.FleetStorage.updateVehicle(selectedVehicleId, {
          sirenActive: newSiren,
          speed: newSiren ? Math.max(50, veh.speed) : veh.speed
        });

        if (newSiren) {
          window.FleetStorage.addNotification({
            title: 'Emergency Siren Activated',
            message: `Priority 1 Siren activated on unit ${veh.registration} (${veh.callSign}) at ${veh.lastLocation}.`,
            type: 'alert'
          });
          window.FleetApp.showToast('Siren Activated', `Priority 1 code enabled for ${veh.callSign}`, 'danger');
        } else {
          window.FleetApp.showToast('Siren Deactivated', `Unit ${veh.callSign} back to 10-8 patrol mode`, 'info');
        }

        renderVehicleList();
        updateMapMarkers();
        renderTelemetryDrawer(window.FleetStorage.getVehicleById(selectedVehicleId));
      });
    }

    // Close Drawer
    const closeDrawerBtn = document.getElementById('btn-close-telemetry-drawer');
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', () => {
        const drawer = document.getElementById('tracking-telemetry-drawer');
        if (drawer) drawer.style.display = 'none';
        selectedVehicleId = null;
        renderVehicleList();
        updateMapMarkers();
      });
    }
  }

  function checkUrlFocus() {
    const params = new URLSearchParams(window.location.search);
    const focusId = params.get('focus');
    if (focusId) {
      setTimeout(() => {
        selectVehicle(focusId);
      }, 500);
    }
  }

  function setElText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  document.addEventListener('DOMContentLoaded', initTracking);

  window.TrackingPage = {
    selectVehicle
  };

})(window);
