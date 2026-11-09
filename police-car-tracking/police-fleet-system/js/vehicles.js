/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * Vehicle Management Controller
 */

(function (window) {
  'use strict';

  let currentEditingVehicleId = null;

  function initVehicles() {
    renderVehicleTable();
    setupFiltersAndSearch();
    setupModalsAndForms();
    checkUrlParams();

    window.addEventListener('fleet_data_updated', renderVehicleTable);
  }

  // 1. Render Table with dynamic filtering
  function renderVehicleTable() {
    const tbody = document.getElementById('vehicles-table-tbody');
    if (!tbody || !window.FleetStorage) return;

    const searchTerm = (document.getElementById('vehicle-search-input')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('vehicle-filter-status')?.value || 'ALL';
    const deptFilter = document.getElementById('vehicle-filter-department')?.value || 'ALL';
    const typeFilter = document.getElementById('vehicle-filter-type')?.value || 'ALL';

    let list = window.FleetStorage.getVehicles();

    // Apply Filters
    if (statusFilter !== 'ALL') {
      list = list.filter(v => v.status === statusFilter);
    }
    if (deptFilter !== 'ALL') {
      list = list.filter(v => v.department === deptFilter);
    }
    if (typeFilter !== 'ALL') {
      list = list.filter(v => v.type === typeFilter);
    }
    if (searchTerm) {
      list = list.filter(v => {
        return (
          v.registration.toLowerCase().includes(searchTerm) ||
          v.callSign.toLowerCase().includes(searchTerm) ||
          v.make.toLowerCase().includes(searchTerm) ||
          v.model.toLowerCase().includes(searchTerm) ||
          (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(searchTerm)) ||
          v.department.toLowerCase().includes(searchTerm) ||
          v.vin.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Counter badge
    const countEl = document.getElementById('vehicles-count-badge');
    if (countEl) countEl.textContent = `${list.length} units listed`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            <i class="fa-solid fa-car-side" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.4;"></i>
            No vehicles match your active search or filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(v => {
      let statusClass = 'status-available';
      if (v.status === 'On Trip') statusClass = 'status-ontrip';
      else if (v.status === 'Maintenance') statusClass = 'status-maintenance';
      else if (v.status === 'Out of Service') statusClass = 'status-outofservice';

      // Fuel progress color
      let fuelColorClass = 'green';
      if (v.fuelLevel < 25) fuelColorClass = 'red';
      else if (v.fuelLevel < 50) fuelColorClass = 'amber';

      return `
        <tr>
          <td>
            <div style="display: flex; flex-direction: column;">
              <span class="plate-badge"><i class="fa-solid fa-shield"></i> ${v.registration}</span>
              <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--text-muted); margin-top: 3px;">${v.callSign}</span>
            </div>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--text-main);">${v.year} ${v.make} ${v.model}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${v.type} &bull; VIN: <span style="font-family: var(--font-mono);">${v.vin.substring(0, 10)}...</span></div>
          </td>
          <td>
            <span style="font-size: 0.8rem; font-weight: 500;">${v.department}</span>
          </td>
          <td>
            ${v.assignedDriverName && v.assignedDriverName !== 'Unassigned'
              ? `<div style="display: flex; align-items: center; gap: 0.4rem;">
                   <i class="fa-solid fa-user-shield text-blue-600" style="color: var(--primary);"></i>
                   <span style="font-weight: 600;">${v.assignedDriverName}</span>
                 </div>`
              : `<span style="color: var(--text-muted); font-style: italic;">Unassigned</span>`
            }
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 3px; min-width: 90px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.7rem; font-family: var(--font-mono); font-weight: 600;">
                <span>Fuel</span>
                <span>${v.fuelLevel}%</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill ${fuelColorClass}" style="width: ${v.fuelLevel}%;"></div>
              </div>
            </div>
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-size: 0.8rem;">${Number(v.mileage).toLocaleString()} mi</span>
          </td>
          <td>
            <span class="status-pill ${statusClass}">
              <span class="dot"></span> ${v.status}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="action-btn-sm" onclick="VehiclesPage.viewDetails('${v.id}')" title="View Dossier">
                <i class="fa-regular fa-eye"></i>
              </button>
              <button class="action-btn-sm" onclick="VehiclesPage.editVehicle('${v.id}')" title="Edit Vehicle">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="action-btn-sm delete" onclick="VehiclesPage.deleteVehicle('${v.id}')" title="Delete / Decommission">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. Setup Filters & Search Listeners
  function setupFiltersAndSearch() {
    const searchInput = document.getElementById('vehicle-search-input');
    const statusSelect = document.getElementById('vehicle-filter-status');
    const deptSelect = document.getElementById('vehicle-filter-department');
    const typeSelect = document.getElementById('vehicle-filter-type');

    if (searchInput) searchInput.addEventListener('input', renderVehicleTable);
    if (statusSelect) statusSelect.addEventListener('change', renderVehicleTable);
    if (deptSelect) deptSelect.addEventListener('change', renderVehicleTable);
    if (typeSelect) typeSelect.addEventListener('change', renderVehicleTable);

    // Export CSV
    const btnExport = document.getElementById('btn-export-vehicles-csv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const vehicles = window.FleetStorage.getVehicles();
        window.FleetApp.exportToCSV('police_fleet_inventory.csv', vehicles);
      });
    }

    // Open Add Vehicle Modal
    const btnAdd = document.getElementById('btn-open-add-vehicle');
    if (btnAdd) {
      btnAdd.addEventListener('click', openAddModal);
    }
  }

  // 3. Modals and Form Handling
  function setupModalsAndForms() {
    // Populate driver dropdown in the add/edit form
    populateDriverSelect();

    // Form submission
    const form = document.getElementById('vehicle-modal-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveVehicleFormData();
      });
    }

    // Quick status toggle in View Details Modal
    const statusSelectModal = document.getElementById('modal-detail-status-select');
    if (statusSelectModal) {
      statusSelectModal.addEventListener('change', function () {
        const vehId = document.getElementById('modal-detail-veh-id')?.value;
        if (vehId) {
          window.FleetStorage.updateVehicle(vehId, { status: this.value });
          window.FleetApp.showToast('Status Updated', `Vehicle status changed to ${this.value}`, 'success');
          renderVehicleTable();
        }
      });
    }
  }

  function populateDriverSelect() {
    const select = document.getElementById('form-veh-driver');
    if (!select || !window.FleetStorage) return;

    const drivers = window.FleetStorage.getDrivers();
    select.innerHTML = `<option value="">-- No Assigned Officer --</option>` +
      drivers.map(d => `<option value="${d.id}">${d.rank} ${d.firstName} ${d.lastName} (Badge #${d.badgeNumber})</option>`).join('');
  }

  function openAddModal() {
    currentEditingVehicleId = null;
    const form = document.getElementById('vehicle-modal-form');
    if (form) form.reset();

    const titleEl = document.getElementById('vehicle-modal-title');
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-plus-circle text-blue-600"></i> Commission New Police Vehicle`;

    // Generate random suggested registration
    const regInput = document.getElementById('form-veh-registration');
    if (regInput) {
      regInput.value = 'POL-' + (Math.floor(Math.random() * 8999) + 1000);
    }
    const callSignInput = document.getElementById('form-veh-callsign');
    if (callSignInput) {
      callSignInput.value = 'Unit-' + (Math.floor(Math.random() * 89) + 10);
    }

    window.FleetApp.openModal('vehicle-crud-modal');
  }

  function editVehicle(id) {
    const veh = window.FleetStorage.getVehicleById(id);
    if (!veh) return;

    currentEditingVehicleId = id;
    const titleEl = document.getElementById('vehicle-modal-title');
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square text-blue-600"></i> Edit Police Vehicle: ${veh.registration}`;

    // Populate inputs
    setFormVal('form-veh-registration', veh.registration);
    setFormVal('form-veh-callsign', veh.callSign);
    setFormVal('form-veh-vin', veh.vin);
    setFormVal('form-veh-make', veh.make);
    setFormVal('form-veh-model', veh.model);
    setFormVal('form-veh-year', veh.year);
    setFormVal('form-veh-type', veh.type);
    setFormVal('form-veh-dept', veh.department);
    setFormVal('form-veh-status', veh.status);
    setFormVal('form-veh-driver', veh.assignedDriverId || '');
    setFormVal('form-veh-mileage', veh.mileage);
    setFormVal('form-veh-fuel', veh.fuelLevel);
    setFormVal('form-veh-location', veh.lastLocation);
    setFormVal('form-veh-notes', veh.notes);

    window.FleetApp.openModal('vehicle-crud-modal');
  }

  function saveVehicleFormData() {
    const reg = getFormVal('form-veh-registration').trim();
    const callSign = getFormVal('form-veh-callsign').trim();
    const make = getFormVal('form-veh-make').trim();
    const model = getFormVal('form-veh-model').trim();
    const year = Number(getFormVal('form-veh-year')) || 2024;
    const type = getFormVal('form-veh-type');
    const dept = getFormVal('form-veh-dept');
    const status = getFormVal('form-veh-status');
    const driverId = getFormVal('form-veh-driver');
    const mileage = Number(getFormVal('form-veh-mileage')) || 0;
    const fuel = Number(getFormVal('form-veh-fuel')) || 100;
    const location = getFormVal('form-veh-location').trim() || 'Central Precinct Headquarters';
    const notes = getFormVal('form-veh-notes').trim();
    const vin = getFormVal('form-veh-vin').trim() || ('1FA' + Math.random().toString(36).substring(2, 12).toUpperCase());

    if (!reg || !callSign || !make || !model) {
      window.FleetApp.showToast('Validation Error', 'Please fill in all required vehicle identification fields.', 'danger');
      return;
    }

    let driverName = 'Unassigned';
    if (driverId) {
      const driver = window.FleetStorage.getDriverById(driverId);
      if (driver) {
        driverName = `${driver.rank} ${driver.firstName} ${driver.lastName}`;
      }
    }

    if (currentEditingVehicleId) {
      // Update
      window.FleetStorage.updateVehicle(currentEditingVehicleId, {
        registration: reg,
        callSign,
        vin,
        make,
        model,
        year,
        type,
        department: dept,
        status,
        assignedDriverId: driverId,
        assignedDriverName: driverName,
        mileage,
        fuelLevel: fuel,
        lastLocation: location,
        notes
      });
      window.FleetApp.showToast('Vehicle Updated', `Vehicle ${reg} records have been updated successfully.`, 'success');
    } else {
      // Add new
      window.FleetStorage.addVehicle({
        registration: reg,
        callSign,
        vin,
        make,
        model,
        year,
        type,
        department: dept,
        status,
        assignedDriverId: driverId,
        assignedDriverName: driverName,
        mileage,
        fuelLevel: fuel,
        fuelCapacity: 75,
        batteryLevel: 98,
        lat: 37.7749 + (Math.random() - 0.5) * 0.04,
        lng: -122.4194 + (Math.random() - 0.5) * 0.04,
        speed: 0,
        heading: 'N',
        sirenActive: false,
        lastLocation: location,
        notes
      });
      window.FleetApp.showToast('Vehicle Registered', `New unit ${reg} commissioned into active duty.`, 'success');
    }

    window.FleetApp.closeModal('vehicle-crud-modal');
    renderVehicleTable();
  }

  function deleteVehicle(id) {
    const veh = window.FleetStorage.getVehicleById(id);
    if (!veh) return;

    window.FleetApp.confirmModal(
      'Decommission Vehicle',
      `Are you sure you want to permanently remove ${veh.registration} (${veh.callSign} - ${veh.make} ${veh.model}) from the active fleet roster? This action cannot be undone.`,
      () => {
        window.FleetStorage.deleteVehicle(id);
        window.FleetApp.showToast('Decommissioned', `Unit ${veh.registration} was removed from service.`, 'warning');
        renderVehicleTable();
      }
    );
  }

  function viewDetails(id) {
    const veh = window.FleetStorage.getVehicleById(id);
    if (!veh) return;

    setElText('modal-detail-reg', veh.registration);
    setElText('modal-detail-callsign', veh.callSign);
    setElText('modal-detail-vin', veh.vin);
    setElText('modal-detail-makemodel', `${veh.year} ${veh.make} ${veh.model}`);
    setElText('modal-detail-dept', veh.department);
    setElText('modal-detail-type', veh.type);
    setElText('modal-detail-driver', veh.assignedDriverName || 'None Assigned');
    setElText('modal-detail-mileage', `${Number(veh.mileage).toLocaleString()} miles`);
    setElText('modal-detail-fuel', `${veh.fuelLevel}% (${Math.round((veh.fuelLevel/100)*(veh.fuelCapacity||75))} L)`);
    setElText('modal-detail-battery', `${veh.batteryLevel || 98}%`);
    setElText('modal-detail-location', veh.lastLocation || 'Station Bay');
    setElText('modal-detail-lastservice', veh.lastServiceDate || 'N/A');
    setElText('modal-detail-nextservice', veh.nextServiceDate || 'N/A');
    setElText('modal-detail-notes', veh.notes || 'No special operational notices recorded.');

    const hiddenIdInput = document.getElementById('modal-detail-veh-id');
    if (hiddenIdInput) hiddenIdInput.value = veh.id;

    const statusSelectModal = document.getElementById('modal-detail-status-select');
    if (statusSelectModal) statusSelectModal.value = veh.status;

    const trackLink = document.getElementById('modal-detail-track-btn');
    if (trackLink) trackLink.href = `tracking.html?focus=${veh.id}`;

    window.FleetApp.openModal('vehicle-details-modal');
  }

  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'add') {
      openAddModal();
    }
  }

  function setFormVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : '';
  }

  function getFormVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function setElText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  document.addEventListener('DOMContentLoaded', initVehicles);

  window.VehiclesPage = {
    openAddModal,
    editVehicle,
    deleteVehicle,
    viewDetails
  };

})(window);
