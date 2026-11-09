/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * Trip Assignment & Dispatch Controller
 */

(function (window) {
  'use strict';

  function initTrips() {
    setupDispatchForm();
    renderActiveDispatchesTable();

    window.addEventListener('fleet_data_updated', () => {
      renderActiveDispatchesTable();
      populateVehicleSelect();
      populateDriverSelect();
    });
  }

  // 1. Setup Form, Auto ID, and Selects
  function setupDispatchForm() {
    generateNewTripId();
    populateVehicleSelect();
    populateDriverSelect();
    setDefaultDateTime();

    const form = document.getElementById('trip-dispatch-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleDispatchSubmit();
      });
    }

    // Reset button
    const resetBtn = document.getElementById('btn-reset-dispatch-form');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        generateNewTripId();
        setDefaultDateTime();
      });
    }
  }

  function generateNewTripId() {
    const input = document.getElementById('dispatch-trip-id');
    if (input) {
      input.value = 'TRP-' + (Math.floor(Math.random() * 8999) + 1000);
    }
  }

  function setDefaultDateTime() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);

    // Calculate arrival + 4 hours
    const arrivalDate = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const arrivalTimeStr = arrivalDate.toTimeString().substring(0, 5);

    const dateInput = document.getElementById('dispatch-dep-date');
    if (dateInput) dateInput.value = dateStr;

    const timeInput = document.getElementById('dispatch-dep-time');
    if (timeInput) timeInput.value = timeStr;

    const arrInput = document.getElementById('dispatch-exp-arrival');
    if (arrInput) arrInput.value = arrivalTimeStr;
  }

  function populateVehicleSelect() {
    const select = document.getElementById('dispatch-vehicle-select');
    if (!select || !window.FleetStorage) return;

    const vehicles = window.FleetStorage.getVehicles();
    let html = `<option value="">-- Select Deployment Vehicle --</option>`;

    vehicles.forEach(v => {
      const isAvail = v.status === 'Available';
      html += `
        <option value="${v.id}" ${!isAvail ? 'disabled' : ''}>
          ${v.registration} — ${v.callSign} (${v.year} ${v.make} ${v.model}) [${v.status}] ${!isAvail ? '❌ (Unavailable)' : '✅ (Ready)'}
        </option>
      `;
    });

    select.innerHTML = html;
  }

  function populateDriverSelect() {
    const select = document.getElementById('dispatch-driver-select');
    if (!select || !window.FleetStorage) return;

    const drivers = window.FleetStorage.getDrivers();
    let html = `<option value="">-- Select Qualified Officer / Driver --</option>`;

    drivers.forEach(d => {
      const isOnDuty = d.status === 'On Duty';
      html += `
        <option value="${d.id}" ${!isOnDuty ? 'disabled' : ''}>
          Badge #${d.badgeNumber} — ${d.rank} ${d.firstName} ${d.lastName} (${d.department}) [${d.status}]
        </option>
      `;
    });

    select.innerHTML = html;
  }

  // 2. Handle Dispatch Submit
  function handleDispatchSubmit() {
    const tripId = getVal('dispatch-trip-id');
    const vehId = getVal('dispatch-vehicle-select');
    const driverId = getVal('dispatch-driver-select');
    const origin = getVal('dispatch-origin').trim();
    const destination = getVal('dispatch-destination').trim();
    const depDate = getVal('dispatch-dep-date');
    const depTime = getVal('dispatch-dep-time');
    const expArrival = getVal('dispatch-exp-arrival');
    const purpose = getVal('dispatch-purpose').trim();
    const priority = getVal('dispatch-priority');
    const notes = getVal('dispatch-notes').trim();

    // Validation
    if (!vehId) {
      window.FleetApp.showToast('Validation Error', 'Please select an available vehicle for dispatch.', 'danger');
      return;
    }
    if (!driverId) {
      window.FleetApp.showToast('Validation Error', 'Please select an on-duty officer/driver.', 'danger');
      return;
    }
    if (!origin || !destination) {
      window.FleetApp.showToast('Validation Error', 'Both starting location and destination are required.', 'danger');
      return;
    }
    if (!purpose) {
      window.FleetApp.showToast('Validation Error', 'Please state the operational journey purpose.', 'danger');
      return;
    }

    const veh = window.FleetStorage.getVehicleById(vehId);
    if (!veh || veh.status !== 'Available') {
      window.FleetApp.showToast('Vehicle Unavailable', `Vehicle ${veh ? veh.registration : ''} is currently ${veh ? veh.status : 'not ready'}.`, 'danger');
      return;
    }

    const driver = window.FleetStorage.getDriverById(driverId);
    const driverName = driver ? `${driver.rank} ${driver.firstName} ${driver.lastName}` : 'Assigned Officer';

    // Create Trip
    const newTrip = {
      id: tripId,
      vehicleId: veh.id,
      vehicleReg: veh.registration,
      callSign: veh.callSign,
      driverId: driver.id,
      driverName: driverName,
      origin: origin,
      destination: destination,
      departureDate: depDate,
      departureTime: depTime,
      expectedArrival: expArrival,
      actualArrival: '',
      purpose: purpose,
      priority: priority,
      status: 'Active',
      distanceKm: Math.floor(Math.random() * 45) + 15,
      notes: notes
    };

    window.FleetStorage.addTrip(newTrip);

    window.FleetApp.showToast(
      'Dispatch Order Dispatched',
      `Trip ${newTrip.id} logged. Unit ${veh.registration} is now deployed under ${driverName}.`,
      'success',
      4500
    );

    // Reset Form
    document.getElementById('trip-dispatch-form').reset();
    generateNewTripId();
    setDefaultDateTime();
    populateVehicleSelect();
    renderActiveDispatchesTable();
  }

  // 3. Render Active and Scheduled Dispatches
  function renderActiveDispatchesTable() {
    const tbody = document.getElementById('active-trips-tbody');
    if (!tbody || !window.FleetStorage) return;

    const trips = window.FleetStorage.getTrips().filter(t => t.status === 'Active' || t.status === 'Scheduled');

    const countBadge = document.getElementById('active-dispatches-count');
    if (countBadge) countBadge.textContent = `${trips.length} active dispatches`;

    if (trips.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            <i class="fa-solid fa-clipboard-check" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.4;"></i>
            No active or scheduled dispatches at this moment. All units are currently in station standby.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = trips.map(t => {
      const isActive = t.status === 'Active';
      return `
        <tr>
          <td>
            <div style="display: flex; flex-direction: column;">
              <span style="font-family: var(--font-mono); font-weight: 700; color: var(--primary); font-size: 0.85rem;">${t.id}</span>
              <span style="font-size: 0.68rem; color: var(--text-muted);">${t.priority}</span>
            </div>
          </td>
          <td>
            <span class="plate-badge"><i class="fa-solid fa-shield"></i> ${t.vehicleReg}</span>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">${t.callSign}</div>
          </td>
          <td>
            <strong>${t.driverName}</strong>
          </td>
          <td>
            <div style="font-weight: 600;">${t.destination}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);"><i class="fa-solid fa-location-dot"></i> Origin: ${t.origin}</div>
            <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px; font-style: italic;">"${t.purpose}"</div>
          </td>
          <td>
            <div style="font-family: var(--font-mono); font-size: 0.75rem;">
              <div>Dep: ${t.departureDate} ${t.departureTime}</div>
              <div style="color: var(--text-muted);">ETA: ${t.expectedArrival}</div>
            </div>
          </td>
          <td>
            <span class="status-pill ${isActive ? 'status-ontrip' : 'status-maintenance'}">
              <span class="dot"></span> ${t.status}
            </span>
          </td>
          <td>
            <div class="table-actions">
              ${isActive ? `
                <button class="btn btn-success btn-sm" onclick="TripsPage.completeTrip('${t.id}')" title="Log Return & Complete Trip" style="padding: 3px 8px; font-size: 0.72rem;">
                  <i class="fa-solid fa-check"></i> Complete
                </button>
              ` : ''}
              <button class="action-btn-sm delete" onclick="TripsPage.cancelTrip('${t.id}')" title="Cancel Dispatch">
                <i class="fa-solid fa-ban"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 4. Complete Trip
  function completeTrip(id) {
    window.FleetApp.confirmModal(
      'Complete Dispatch Order',
      `Confirm unit return to base and mark trip ${id} as Completed? Vehicle status will return to Available.`,
      () => {
        const now = new Date();
        const timeStr = now.toTimeString().substring(0, 5);
        window.FleetStorage.updateTrip(id, {
          status: 'Completed',
          actualArrival: timeStr
        });
        window.FleetApp.showToast('Trip Completed', `Trip ${id} marked completed. Vehicle returned to Available pool.`, 'success');
        renderActiveDispatchesTable();
      }
    );
  }

  // 5. Cancel Trip
  function cancelTrip(id) {
    window.FleetApp.confirmModal(
      'Cancel Dispatch',
      `Are you sure you want to cancel dispatch ${id}?`,
      () => {
        window.FleetStorage.updateTrip(id, {
          status: 'Cancelled'
        });
        window.FleetApp.showToast('Dispatch Cancelled', `Trip ${id} was cancelled.`, 'warning');
        renderActiveDispatchesTable();
      }
    );
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  document.addEventListener('DOMContentLoaded', initTrips);

  window.TripsPage = {
    completeTrip,
    cancelTrip
  };

})(window);
