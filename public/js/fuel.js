/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * Fuel Management & Efficiency Analytics Controller
 */

(function (window) {
  'use strict';

  let fuelChartInstance = null;

  function initFuel() {
    renderKPIs();
    renderFuelTable();
    initFuelChart();
    setupFilters();
    setupModalsAndForms();

    window.addEventListener('fleet_data_updated', () => {
      renderKPIs();
      renderFuelTable();
      initFuelChart();
    });
  }

  // 1. Fuel KPI Cards
  function renderKPIs() {
    if (!window.FleetStorage) return;
    const fuelLogs = window.FleetStorage.getFuel();

    const totalLitres = fuelLogs.reduce((sum, f) => sum + (Number(f.litres) || 0), 0);
    const totalCost = fuelLogs.reduce((sum, f) => sum + (Number(f.cost) || 0), 0);
    const avgCostPerLitre = totalLitres > 0 ? (totalCost / totalLitres).toFixed(2) : '1.85';

    setElText('fuel-kpi-litres', `${totalLitres.toLocaleString()} L`);
    setElText('fuel-kpi-cost', `$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    setElText('fuel-kpi-avgprice', `$${avgCostPerLitre} / L`);
    setElText('fuel-kpi-entries', `${fuelLogs.length} logs`);
  }

  // 2. Render Fuel Table
  function renderFuelTable() {
    const tbody = document.getElementById('fuel-table-tbody');
    if (!tbody || !window.FleetStorage) return;

    const searchTerm = (document.getElementById('fuel-search-input')?.value || '').toLowerCase().trim();
    let list = window.FleetStorage.getFuel();

    if (searchTerm) {
      list = list.filter(f => {
        return (
          f.id.toLowerCase().includes(searchTerm) ||
          f.vehicleReg.toLowerCase().includes(searchTerm) ||
          f.station.toLowerCase().includes(searchTerm) ||
          (f.officer && f.officer.toLowerCase().includes(searchTerm)) ||
          f.fuelType.toLowerCase().includes(searchTerm)
        );
      });
    }

    const countBadge = document.getElementById('fuel-count-badge');
    if (countBadge) countBadge.textContent = `${list.length} fuel entries`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            <i class="fa-solid fa-gas-pump" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.4;"></i>
            No fuel logs recorded matching query.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(f => {
      return `
        <tr>
          <td>
            <span style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${f.id}</span>
          </td>
          <td>
            <span class="plate-badge"><i class="fa-solid fa-shield"></i> ${f.vehicleReg}</span>
          </td>
          <td>
            <div style="font-weight: 600;">${f.station}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${f.fuelType || 'Unleaded'}</div>
          </td>
          <td>
            <div style="font-size: 0.78rem;">${f.officer || 'Duty Officer'}</div>
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-weight: 700;">${f.litres} L</span>
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-weight: 700; color: #16a34a;">$${Number(f.cost).toFixed(2)}</span>
            <div style="font-size: 0.68rem; color: var(--text-muted);">$${f.pricePerLitre || 1.85}/L</div>
          </td>
          <td>
            <div style="font-family: var(--font-mono); font-size: 0.75rem;">
              <div>${f.date}</div>
              <div style="color: var(--text-muted);">${Number(f.mileage).toLocaleString()} mi</div>
            </div>
          </td>
          <td>
            <div class="table-actions">
              <button class="action-btn-sm delete" onclick="FuelPage.deleteFuel('${f.id}')" title="Delete Log">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 3. Fuel Chart.js
  function initFuelChart() {
    const canvas = document.getElementById('fuel-trends-chart');
    if (!canvas || !window.Chart || !window.FleetStorage) return;

    const ctx = canvas.getContext('2d');
    if (fuelChartInstance) fuelChartInstance.destroy();

    const fuelLogs = window.FleetStorage.getFuel();
    const vehMap = {};

    fuelLogs.forEach(f => {
      vehMap[f.vehicleReg] = (vehMap[f.vehicleReg] || 0) + Number(f.litres);
    });

    const labels = Object.keys(vehMap);
    const dataValues = Object.values(vehMap);

    fuelChartInstance = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Litres Dispensed',
          data: dataValues,
          backgroundColor: '#3b82f6',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { font: { family: 'JetBrains Mono', size: 11 } }
          },
          x: {
            ticks: { font: { family: 'JetBrains Mono', size: 11 } }
          }
        }
      }
    });
  }

  // 4. Setup Filters & Buttons
  function setupFilters() {
    const searchInput = document.getElementById('fuel-search-input');
    if (searchInput) searchInput.addEventListener('input', renderFuelTable);

    const btnExport = document.getElementById('btn-export-fuel-csv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const logs = window.FleetStorage.getFuel();
        window.FleetApp.exportToCSV('police_fuel_expenditure_log.csv', logs);
      });
    }

    const btnAdd = document.getElementById('btn-open-add-fuel');
    if (btnAdd) {
      btnAdd.addEventListener('click', openAddModal);
    }
  }

  // 5. Modals and Forms
  function setupModalsAndForms() {
    populateVehicleSelect();

    const form = document.getElementById('fuel-modal-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveFuelFormData();
      });
    }

    // Auto-calculate cost when litres or price changes
    const litresInput = document.getElementById('form-fuel-litres');
    const priceInput = document.getElementById('form-fuel-price');
    const totalCostInput = document.getElementById('form-fuel-cost');

    function calcCost() {
      const l = parseFloat(litresInput?.value || 0);
      const p = parseFloat(priceInput?.value || 0);
      if (totalCostInput && l && p) {
        totalCostInput.value = (l * p).toFixed(2);
      }
    }

    if (litresInput) litresInput.addEventListener('input', calcCost);
    if (priceInput) priceInput.addEventListener('input', calcCost);
  }

  function populateVehicleSelect() {
    const select = document.getElementById('form-fuel-vehicle');
    if (!select || !window.FleetStorage) return;

    const vehicles = window.FleetStorage.getVehicles();
    select.innerHTML = `<option value="">-- Select Vehicle --</option>` +
      vehicles.map(v => `<option value="${v.id}">${v.registration} — ${v.callSign} (${v.make} ${v.model})</option>`).join('');
  }

  function openAddModal() {
    const form = document.getElementById('fuel-modal-form');
    if (form) form.reset();

    const dateInput = document.getElementById('form-fuel-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const priceInput = document.getElementById('form-fuel-price');
    if (priceInput) priceInput.value = '1.85';

    window.FleetApp.openModal('fuel-crud-modal');
  }

  function saveFuelFormData() {
    const vehId = getFormVal('form-fuel-vehicle');
    const litres = Number(getFormVal('form-fuel-litres')) || 0;
    const price = Number(getFormVal('form-fuel-price')) || 1.85;
    const cost = Number(getFormVal('form-fuel-cost')) || (litres * price);
    const date = getFormVal('form-fuel-date');
    const mileage = Number(getFormVal('form-fuel-mileage')) || 0;
    const station = getFormVal('form-fuel-station').trim() || 'Central Fleet Depot';
    const fuelType = getFormVal('form-fuel-type');
    const officer = getFormVal('form-fuel-officer').trim() || 'Duty Officer';

    if (!vehId || !litres || !cost) {
      window.FleetApp.showToast('Validation Error', 'Please select a vehicle and enter fuel quantity.', 'danger');
      return;
    }

    const veh = window.FleetStorage.getVehicleById(vehId);
    const vehReg = veh ? veh.registration : 'POL-UNIT';

    window.FleetStorage.addFuel({
      vehicleId: vehId,
      vehicleReg,
      litres,
      pricePerLitre: price,
      cost,
      date,
      mileage,
      station,
      fuelType,
      officer
    });

    window.FleetApp.showToast('Fuel Logged', `Logged ${litres} L for unit ${vehReg}. Fuel tank refilled to 98%.`, 'success');
    window.FleetApp.closeModal('fuel-crud-modal');

    renderFuelTable();
    renderKPIs();
    initFuelChart();
  }

  function deleteFuel(id) {
    window.FleetApp.confirmModal(
      'Delete Fuel Entry',
      `Delete fuel slip ${id}?`,
      () => {
        window.FleetStorage.deleteFuel(id);
        window.FleetApp.showToast('Deleted', 'Fuel slip deleted.', 'warning');
        renderFuelTable();
        renderKPIs();
        initFuelChart();
      }
    );
  }

  function getFormVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function setElText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  document.addEventListener('DOMContentLoaded', initFuel);

  window.FuelPage = {
    openAddModal,
    deleteFuel
  };

})(window);
