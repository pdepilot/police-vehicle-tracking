/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * Trip History & Manifest Archive Controller
 */

(function (window) {
  'use strict';

  function initTripHistory() {
    renderHistoryTable();
    setupFilters();

    window.addEventListener('fleet_data_updated', renderHistoryTable);
  }

  function renderHistoryTable() {
    const tbody = document.getElementById('history-table-tbody');
    if (!tbody || !window.FleetStorage) return;

    const searchTerm = (document.getElementById('history-search-input')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('history-filter-status')?.value || 'ALL';
    const sortBy = document.getElementById('history-sort-by')?.value || 'date_desc';

    let list = window.FleetStorage.getTrips();

    // Filter
    if (statusFilter !== 'ALL') {
      list = list.filter(t => t.status === statusFilter);
    }
    if (searchTerm) {
      list = list.filter(t => {
        return (
          t.id.toLowerCase().includes(searchTerm) ||
          t.vehicleReg.toLowerCase().includes(searchTerm) ||
          t.callSign.toLowerCase().includes(searchTerm) ||
          t.driverName.toLowerCase().includes(searchTerm) ||
          t.destination.toLowerCase().includes(searchTerm) ||
          t.origin.toLowerCase().includes(searchTerm) ||
          t.purpose.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Sort
    if (sortBy === 'date_desc') {
      list.sort((a, b) => (b.departureDate + b.departureTime).localeCompare(a.departureDate + a.departureTime));
    } else if (sortBy === 'date_asc') {
      list.sort((a, b) => (a.departureDate + a.departureTime).localeCompare(b.departureDate + b.departureTime));
    } else if (sortBy === 'distance_desc') {
      list.sort((a, b) => (b.distanceKm || 0) - (a.distanceKm || 0));
    }

    const countBadge = document.getElementById('history-count-badge');
    if (countBadge) countBadge.textContent = `${list.length} manifests recorded`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            <i class="fa-solid fa-clock-rotate-left" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.4;"></i>
            No past or active trip logs match your query.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(t => {
      let statusClass = 'status-available';
      if (t.status === 'Active') statusClass = 'status-ontrip';
      else if (t.status === 'Scheduled') statusClass = 'status-maintenance';
      else if (t.status === 'Cancelled') statusClass = 'status-outofservice';

      return `
        <tr>
          <td>
            <span style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${t.id}</span>
            <div style="font-size: 0.68rem; color: var(--text-muted);">${t.priority}</div>
          </td>
          <td>
            <span class="plate-badge"><i class="fa-solid fa-shield"></i> ${t.vehicleReg}</span>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">${t.callSign}</div>
          </td>
          <td>
            <strong>${t.driverName}</strong>
          </td>
          <td>
            <span style="font-size: 0.78rem;"><i class="fa-solid fa-circle-dot text-slate-400"></i> ${t.origin}</span>
          </td>
          <td>
            <span style="font-weight: 600; font-size: 0.8rem;"><i class="fa-solid fa-location-dot text-red-500" style="color: var(--danger);"></i> ${t.destination}</span>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${t.purpose}</div>
          </td>
          <td>
            <div style="font-family: var(--font-mono); font-size: 0.74rem;">
              <div>Dep: ${t.departureDate} ${t.departureTime}</div>
              <div style="color: var(--text-muted);">Arr: ${t.actualArrival || t.expectedArrival || '—'}</div>
            </div>
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-weight: 600;">${t.distanceKm || 20} km</span>
          </td>
          <td>
            <span class="status-pill ${statusClass}">
              <span class="dot"></span> ${t.status}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  function setupFilters() {
    const searchInput = document.getElementById('history-search-input');
    const statusSelect = document.getElementById('history-filter-status');
    const sortSelect = document.getElementById('history-sort-by');

    if (searchInput) searchInput.addEventListener('input', renderHistoryTable);
    if (statusSelect) statusSelect.addEventListener('change', renderHistoryTable);
    if (sortSelect) sortSelect.addEventListener('change', renderHistoryTable);

    // Export CSV
    const btnExport = document.getElementById('btn-export-history-csv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const trips = window.FleetStorage.getTrips();
        window.FleetApp.exportToCSV('police_trip_history_log.csv', trips);
      });
    }

    // Print
    const btnPrint = document.getElementById('btn-print-history');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initTripHistory);

})(window);
