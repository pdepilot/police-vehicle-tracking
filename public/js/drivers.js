/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * Driver & Officer Roster Controller
 */

(function (window) {
  'use strict';

  let currentEditingDriverId = null;

  function initDrivers() {
    renderDriverRoster();
    setupFilters();
    setupModalsAndForms();
    checkUrlParams();

    window.addEventListener('fleet_data_updated', renderDriverRoster);
  }

  // 1. Render Driver Cards / Roster
  function renderDriverRoster() {
    const container = document.getElementById('drivers-grid-container');
    if (!container || !window.FleetStorage) return;

    const searchTerm = (document.getElementById('driver-search-input')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('driver-filter-status')?.value || 'ALL';
    const deptFilter = document.getElementById('driver-filter-department')?.value || 'ALL';

    let list = window.FleetStorage.getDrivers();

    if (statusFilter !== 'ALL') {
      list = list.filter(d => d.status === statusFilter);
    }
    if (deptFilter !== 'ALL') {
      list = list.filter(d => d.department === deptFilter);
    }
    if (searchTerm) {
      list = list.filter(d => {
        const fullName = `${d.firstName} ${d.lastName}`.toLowerCase();
        return (
          fullName.includes(searchTerm) ||
          d.badgeNumber.includes(searchTerm) ||
          d.rank.toLowerCase().includes(searchTerm) ||
          d.department.toLowerCase().includes(searchTerm) ||
          (d.phone && d.phone.includes(searchTerm))
        );
      });
    }

    const counter = document.getElementById('drivers-count-badge');
    if (counter) counter.textContent = `${list.length} officers on roster`;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light); color: var(--text-muted);">
          <i class="fa-solid fa-user-shield" style="font-size: 2.5rem; margin-bottom: 0.75rem; display: block; opacity: 0.3;"></i>
          No officers or drivers match your filter criteria.
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(d => {
      let statusClass = 'status-available';
      if (d.status === 'Off Duty') statusClass = 'status-outofservice';
      else if (d.status === 'On Leave') statusClass = 'status-maintenance';

      return `
        <div class="content-card" style="transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div class="card-header" style="padding: 1rem 1.25rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div class="user-avatar" style="width: 44px; height: 44px; font-size: 1.1rem; background: linear-gradient(135deg, #1e3a8a, #2563eb);">
                ${d.firstName.charAt(0)}${d.lastName.charAt(0)}
              </div>
              <div>
                <div style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; color: var(--text-main);">
                  ${d.rank} ${d.firstName} ${d.lastName}
                </div>
                <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--primary); font-weight: 600;">
                  <i class="fa-solid fa-id-badge"></i> BADGE #${d.badgeNumber}
                </div>
              </div>
            </div>
            <span class="status-pill ${statusClass}">
              <span class="dot"></span> ${d.status}
            </span>
          </div>

          <div class="card-body" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.76rem;">
              <div>
                <span style="color: var(--text-muted); display: block;">Division</span>
                <span style="font-weight: 600; color: var(--text-main);">${d.department}</span>
              </div>
              <div>
                <span style="color: var(--text-muted); display: block;">Assigned Vehicle</span>
                <span class="plate-badge" style="font-size: 0.7rem; margin-top: 2px;">
                  <i class="fa-solid fa-car"></i> ${d.assignedVehicleReg || 'None'}
                </span>
              </div>
              <div>
                <span style="color: var(--text-muted); display: block;">EVOC Level</span>
                <span style="font-weight: 600; color: var(--text-main);">${d.evocLevel || 'Certified'}</span>
              </div>
              <div>
                <span style="color: var(--text-muted); display: block;">Service</span>
                <span style="font-weight: 600; color: var(--text-main);">${d.yearsOfService || 5} Years</span>
              </div>
            </div>

            <div style="border-top: 1px dashed var(--border-light); padding-top: 0.65rem;">
              <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Certifications</span>
              <div style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                ${(d.certifications || []).map(c => `
                  <span style="font-size: 0.66rem; background: var(--bg-card-subtle); border: 1px solid var(--border-light); padding: 2px 6px; border-radius: 4px; color: var(--text-secondary); font-weight: 500;">
                    ${c}
                  </span>
                `).join('')}
              </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border-light); padding-top: 0.75rem; margin-top: auto;">
              <span><i class="fa-solid fa-phone"></i> ${d.phone}</span>
              <div class="table-actions">
                <button class="action-btn-sm" onclick="DriversPage.viewDossier('${d.id}')" title="View Dossier">
                  <i class="fa-regular fa-eye"></i>
                </button>
                <button class="action-btn-sm" onclick="DriversPage.editDriver('${d.id}')" title="Edit Officer">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="action-btn-sm delete" onclick="DriversPage.deleteDriver('${d.id}')" title="Remove from Roster">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. Setup Search & Filters
  function setupFilters() {
    const searchInput = document.getElementById('driver-search-input');
    const statusSelect = document.getElementById('driver-filter-status');
    const deptSelect = document.getElementById('driver-filter-department');

    if (searchInput) searchInput.addEventListener('input', renderDriverRoster);
    if (statusSelect) statusSelect.addEventListener('change', renderDriverRoster);
    if (deptSelect) deptSelect.addEventListener('change', renderDriverRoster);

    // Export CSV
    const btnExport = document.getElementById('btn-export-drivers-csv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const drivers = window.FleetStorage.getDrivers();
        window.FleetApp.exportToCSV('police_officer_roster.csv', drivers);
      });
    }

    // Add Driver Button
    const btnAdd = document.getElementById('btn-open-add-driver');
    if (btnAdd) {
      btnAdd.addEventListener('click', openAddModal);
    }
  }

  // 3. Modals and Forms
  function setupModalsAndForms() {
    populateVehicleSelect();

    const form = document.getElementById('driver-modal-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveDriverFormData();
      });
    }
  }

  function populateVehicleSelect() {
    const select = document.getElementById('form-drv-vehicle');
    if (!select || !window.FleetStorage) return;

    const vehicles = window.FleetStorage.getVehicles();
    select.innerHTML = `<option value="">-- No Vehicle Assigned --</option>` +
      vehicles.map(v => `<option value="${v.id}">${v.registration} (${v.callSign} - ${v.make} ${v.model}) [${v.status}]</option>`).join('');
  }

  function openAddModal() {
    currentEditingDriverId = null;
    const form = document.getElementById('driver-modal-form');
    if (form) form.reset();

    const titleEl = document.getElementById('driver-modal-title');
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-user-plus text-blue-600"></i> Enroll Officer into Fleet Roster`;

    const badgeInput = document.getElementById('form-drv-badge');
    if (badgeInput) {
      badgeInput.value = Math.floor(Math.random() * 8999) + 1000;
    }

    window.FleetApp.openModal('driver-crud-modal');
  }

  function editDriver(id) {
    const driver = window.FleetStorage.getDriverById(id);
    if (!driver) return;

    currentEditingDriverId = id;
    const titleEl = document.getElementById('driver-modal-title');
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-user-pen text-blue-600"></i> Edit Officer: Badge #${driver.badgeNumber}`;

    setFormVal('form-drv-badge', driver.badgeNumber);
    setFormVal('form-drv-rank', driver.rank);
    setFormVal('form-drv-firstname', driver.firstName);
    setFormVal('form-drv-lastname', driver.lastName);
    setFormVal('form-drv-dept', driver.department);
    setFormVal('form-drv-status', driver.status);
    setFormVal('form-drv-phone', driver.phone);
    setFormVal('form-drv-email', driver.email);
    setFormVal('form-drv-license', driver.licenseClass);
    setFormVal('form-drv-evoc', driver.evocLevel);
    setFormVal('form-drv-vehicle', driver.assignedVehicleId || '');
    setFormVal('form-drv-years', driver.yearsOfService);

    window.FleetApp.openModal('driver-crud-modal');
  }

  function saveDriverFormData() {
    const badge = getFormVal('form-drv-badge').trim();
    const rank = getFormVal('form-drv-rank');
    const first = getFormVal('form-drv-firstname').trim();
    const last = getFormVal('form-drv-lastname').trim();
    const dept = getFormVal('form-drv-dept');
    const status = getFormVal('form-drv-status');
    const phone = getFormVal('form-drv-phone').trim();
    const email = getFormVal('form-drv-email').trim();
    const license = getFormVal('form-drv-license');
    const evoc = getFormVal('form-drv-evoc');
    const vehId = getFormVal('form-drv-vehicle');
    const years = Number(getFormVal('form-drv-years')) || 1;

    if (!badge || !first || !last) {
      window.FleetApp.showToast('Validation Error', 'Please complete Officer Badge #, First Name, and Last Name.', 'danger');
      return;
    }

    let vehReg = '';
    if (vehId) {
      const veh = window.FleetStorage.getVehicleById(vehId);
      if (veh) vehReg = veh.registration;
    }

    if (currentEditingDriverId) {
      window.FleetStorage.updateDriver(currentEditingDriverId, {
        badgeNumber: badge,
        rank,
        firstName: first,
        lastName: last,
        department: dept,
        status,
        phone,
        email,
        licenseClass: license,
        evocLevel: evoc,
        assignedVehicleId: vehId,
        assignedVehicleReg: vehReg,
        yearsOfService: years
      });
      window.FleetApp.showToast('Updated', `Roster record for ${rank} ${first} ${last} updated.`, 'success');
    } else {
      window.FleetStorage.addDriver({
        badgeNumber: badge,
        rank,
        firstName: first,
        lastName: last,
        department: dept,
        status,
        phone,
        email,
        licenseClass: license,
        evocLevel: evoc,
        certifications: ['EVOC Certified', 'Tactical Safe Pursuit', 'Radio Dispatch Protocol'],
        assignedVehicleId: vehId,
        assignedVehicleReg: vehReg,
        yearsOfService: years
      });
      window.FleetApp.showToast('Enrolled', `Officer ${rank} ${first} ${last} enrolled into fleet roster.`, 'success');
    }

    // Update vehicle assignment if selected
    if (vehId) {
      window.FleetStorage.updateVehicle(vehId, {
        assignedDriverId: currentEditingDriverId || '',
        assignedDriverName: `${rank} ${first} ${last}`
      });
    }

    window.FleetApp.closeModal('driver-crud-modal');
    renderDriverRoster();
  }

  function deleteDriver(id) {
    const driver = window.FleetStorage.getDriverById(id);
    if (!driver) return;

    window.FleetApp.confirmModal(
      'Remove Driver',
      `Are you sure you want to remove ${driver.rank} ${driver.firstName} ${driver.lastName} (Badge #${driver.badgeNumber}) from the system roster?`,
      () => {
        window.FleetStorage.deleteDriver(id);
        window.FleetApp.showToast('Removed', 'Officer removed from active roster.', 'warning');
        renderDriverRoster();
      }
    );
  }

  function viewDossier(id) {
    const d = window.FleetStorage.getDriverById(id);
    if (!d) return;

    setElText('dossier-name', `${d.rank} ${d.firstName} ${d.lastName}`);
    setElText('dossier-badge', `BADGE #${d.badgeNumber}`);
    setElText('dossier-dept', d.department);
    setElText('dossier-status', d.status);
    setElText('dossier-phone', d.phone);
    setElText('dossier-email', d.email);
    setElText('dossier-license', d.licenseClass);
    setElText('dossier-evoc', d.evocLevel);
    setElText('dossier-years', `${d.yearsOfService} Years Active Service`);
    setElText('dossier-vehicle', d.assignedVehicleReg || 'None Assigned');

    const certContainer = document.getElementById('dossier-certs-list');
    if (certContainer) {
      certContainer.innerHTML = (d.certifications || []).map(c => `
        <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 3px 8px; border-radius: 4px; font-weight: 600;">
          <i class="fa-solid fa-award"></i> ${c}
        </span>
      `).join('');
    }

    window.FleetApp.openModal('driver-dossier-modal');
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

  document.addEventListener('DOMContentLoaded', initDrivers);

  window.DriversPage = {
    openAddModal,
    editDriver,
    deleteDriver,
    viewDossier
  };

})(window);
