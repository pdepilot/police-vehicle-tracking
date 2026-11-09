/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * Maintenance & Workshop Service Controller
 */

(function (window) {
  'use strict';

  let currentEditingMntId = null;

  function initMaintenance() {
    renderKPIs();
    renderMaintenanceTable();
    setupFilters();
    setupModalsAndForms();
    checkUrlParams();

    window.addEventListener('fleet_data_updated', () => {
      renderKPIs();
      renderMaintenanceTable();
    });
  }

  // 1. KPI Cards
  function renderKPIs() {
    if (!window.FleetStorage) return;
    const records = window.FleetStorage.getMaintenance();

    const inProgress = records.filter(r => r.status === 'In Progress').length;
    const pending = records.filter(r => r.status === 'Pending').length;
    const completed = records.filter(r => r.status === 'Completed').length;
    const totalCost = records.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);

    setElText('mnt-kpi-inprogress', inProgress);
    setElText('mnt-kpi-pending', pending);
    setElText('mnt-kpi-completed', completed);
    setElText('mnt-kpi-totalcost', `$${totalCost.toLocaleString()}`);
  }

  // 2. Render Maintenance Logs Table
  function renderMaintenanceTable() {
    const tbody = document.getElementById('maintenance-table-tbody');
    if (!tbody || !window.FleetStorage) return;

    const searchTerm = (document.getElementById('mnt-search-input')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('mnt-filter-status')?.value || 'ALL';

    let list = window.FleetStorage.getMaintenance();

    if (statusFilter !== 'ALL') {
      list = list.filter(m => m.status === statusFilter);
    }
    if (searchTerm) {
      list = list.filter(m => {
        return (
          m.id.toLowerCase().includes(searchTerm) ||
          m.vehicleReg.toLowerCase().includes(searchTerm) ||
          (m.vehicleModel && m.vehicleModel.toLowerCase().includes(searchTerm)) ||
          m.type.toLowerCase().includes(searchTerm) ||
          (m.provider && m.provider.toLowerCase().includes(searchTerm)) ||
          (m.technician && m.technician.toLowerCase().includes(searchTerm))
        );
      });
    }

    const badge = document.getElementById('maintenance-count-badge');
    if (badge) badge.textContent = `${list.length} service records`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            <i class="fa-solid fa-screwdriver-wrench" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.4;"></i>
            No maintenance records match your active criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(m => {
      let statusClass = 'status-available';
      if (m.status === 'In Progress') statusClass = 'status-maintenance';
      else if (m.status === 'Pending') statusClass = 'status-ontrip';

      return `
        <tr>
          <td>
            <span style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${m.id}</span>
          </td>
          <td>
            <span class="plate-badge"><i class="fa-solid fa-shield"></i> ${m.vehicleReg}</span>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">${m.vehicleModel || 'Fleet Unit'}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--text-main);">${m.type}</div>
            <div style="font-size: 0.72rem; color: var(--text-secondary); max-width: 260px;">${m.description}</div>
          </td>
          <td>
            <div style="font-size: 0.76rem;">${m.provider || 'Metro Workshop'}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);"><i class="fa-solid fa-user-gear"></i> ${m.technician || 'Assigned Tech'}</div>
          </td>
          <td>
            <div style="font-family: var(--font-mono); font-size: 0.75rem;">
              <div>Logged: ${m.reportedDate}</div>
              <div style="color: var(--primary);">Next: ${m.nextServiceDate || 'TBD'}</div>
            </div>
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-weight: 700; color: var(--text-main);">$${Number(m.cost).toLocaleString()}</span>
          </td>
          <td>
            <span class="status-pill ${statusClass}">
              <span class="dot"></span> ${m.status}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="action-btn-sm" onclick="MaintenancePage.editMaintenance('${m.id}')" title="Edit Service Record">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="action-btn-sm delete" onclick="MaintenancePage.deleteMaintenance('${m.id}')" title="Delete Record">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 3. Setup Filters & Buttons
  function setupFilters() {
    const searchInput = document.getElementById('mnt-search-input');
    const statusSelect = document.getElementById('mnt-filter-status');

    if (searchInput) searchInput.addEventListener('input', renderMaintenanceTable);
    if (statusSelect) statusSelect.addEventListener('change', renderMaintenanceTable);

    const btnExport = document.getElementById('btn-export-maintenance-csv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const records = window.FleetStorage.getMaintenance();
        window.FleetApp.exportToCSV('police_fleet_maintenance_log.csv', records);
      });
    }

    const btnAdd = document.getElementById('btn-open-add-maintenance');
    if (btnAdd) {
      btnAdd.addEventListener('click', openAddModal);
    }
  }

  // 4. Modals and Forms
  function setupModalsAndForms() {
    populateVehicleSelect();

    const form = document.getElementById('maintenance-modal-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveMaintenanceFormData();
      });
    }
  }

  function populateVehicleSelect() {
    const select = document.getElementById('form-mnt-vehicle');
    if (!select || !window.FleetStorage) return;

    const vehicles = window.FleetStorage.getVehicles();
    select.innerHTML = `<option value="">-- Select Police Unit --</option>` +
      vehicles.map(v => `<option value="${v.id}">${v.registration} — ${v.callSign} (${v.make} ${v.model})</option>`).join('');
  }

  function openAddModal() {
    currentEditingMntId = null;
    const form = document.getElementById('maintenance-modal-form');
    if (form) form.reset();

    const titleEl = document.getElementById('maintenance-modal-title');
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-wrench text-blue-600"></i> Book Fleet Service / Maintenance`;

    // Defaults
    const dateInput = document.getElementById('form-mnt-reported-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    window.FleetApp.openModal('maintenance-crud-modal');
  }

  function editMaintenance(id) {
    const m = window.FleetStorage.getMaintenance().find(item => item.id === id);
    if (!m) return;

    currentEditingMntId = id;
    const titleEl = document.getElementById('maintenance-modal-title');
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square text-blue-600"></i> Edit Service Record: ${m.id}`;

    setFormVal('form-mnt-vehicle', m.vehicleId);
    setFormVal('form-mnt-type', m.type);
    setFormVal('form-mnt-desc', m.description);
    setFormVal('form-mnt-cost', m.cost);
    setFormVal('form-mnt-reported-date', m.reportedDate);
    setFormVal('form-mnt-service-date', m.serviceDate);
    setFormVal('form-mnt-next-date', m.nextServiceDate);
    setFormVal('form-mnt-provider', m.provider);
    setFormVal('form-mnt-tech', m.technician);
    setFormVal('form-mnt-status', m.status);

    window.FleetApp.openModal('maintenance-crud-modal');
  }

  function saveMaintenanceFormData() {
    const vehId = getFormVal('form-mnt-vehicle');
    const type = getFormVal('form-mnt-type').trim();
    const desc = getFormVal('form-mnt-desc').trim();
    const cost = Number(getFormVal('form-mnt-cost')) || 0;
    const repDate = getFormVal('form-mnt-reported-date');
    const srvDate = getFormVal('form-mnt-service-date') || repDate;
    const nextDate = getFormVal('form-mnt-next-date');
    const provider = getFormVal('form-mnt-provider').trim() || 'Central Fleet Workshop';
    const tech = getFormVal('form-mnt-tech').trim() || 'Staff Technician';
    const status = getFormVal('form-mnt-status');

    if (!vehId || !type) {
      window.FleetApp.showToast('Validation Error', 'Please select a vehicle and specify service type.', 'danger');
      return;
    }

    const veh = window.FleetStorage.getVehicleById(vehId);
    const vehReg = veh ? veh.registration : 'POL-UNIT';
    const vehModel = veh ? `${veh.make} ${veh.model}` : '';

    if (currentEditingMntId) {
      window.FleetStorage.updateMaintenance(currentEditingMntId, {
        vehicleId: vehId,
        vehicleReg,
        vehicleModel,
        type,
        description: desc,
        cost,
        reportedDate: repDate,
        serviceDate: srvDate,
        nextServiceDate: nextDate,
        provider,
        technician: tech,
        status
      });
      window.FleetApp.showToast('Updated', `Maintenance order ${currentEditingMntId} updated.`, 'success');
    } else {
      window.FleetStorage.addMaintenance({
        vehicleId: vehId,
        vehicleReg,
        vehicleModel,
        type,
        description: desc,
        cost,
        reportedDate: repDate,
        serviceDate: srvDate,
        nextServiceDate: nextDate,
        provider,
        technician: tech,
        status
      });
      window.FleetApp.showToast('Service Booked', `Maintenance for ${vehReg} entered into workshop log.`, 'success');
    }

    window.FleetApp.closeModal('maintenance-crud-modal');
    renderMaintenanceTable();
    renderKPIs();
  }

  function deleteMaintenance(id) {
    window.FleetApp.confirmModal(
      'Delete Service Record',
      `Delete maintenance log ${id}?`,
      () => {
        window.FleetStorage.deleteMaintenance(id);
        window.FleetApp.showToast('Deleted', 'Service record deleted.', 'warning');
        renderMaintenanceTable();
        renderKPIs();
      }
    );
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

  document.addEventListener('DOMContentLoaded', initMaintenance);

  window.MaintenancePage = {
    openAddModal,
    editMaintenance,
    deleteMaintenance
  };

})(window);
