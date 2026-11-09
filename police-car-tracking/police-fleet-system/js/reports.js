/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * Reports & Operational Analytics Controller (Chart.js)
 */

(function (window) {
  'use strict';

  let tripsBarChart = null;
  let departmentPolarChart = null;
  let costComparisonChart = null;
  let responseTimeChart = null;

  function initReports() {
    renderKPIs();
    renderAllCharts();
    setupActions();

    window.addEventListener('fleet_data_updated', () => {
      renderKPIs();
      renderAllCharts();
    });
  }

  function renderKPIs() {
    if (!window.FleetStorage) return;

    const vehicles = window.FleetStorage.getVehicles();
    const trips = window.FleetStorage.getTrips();
    const mnt = window.FleetStorage.getMaintenance();
    const fuel = window.FleetStorage.getFuel();

    const totalDistance = trips.reduce((sum, t) => sum + (Number(t.distanceKm) || 0), 0);
    const completedTrips = trips.filter(t => t.status === 'Completed').length;
    const totalMntCost = mnt.reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
    const totalFuelCost = fuel.reduce((sum, f) => sum + (Number(f.cost) || 0), 0);

    const availableCount = vehicles.filter(v => v.status === 'Available').length;
    const readinessRate = vehicles.length > 0 ? Math.round((availableCount / vehicles.length) * 100) : 0;

    setElText('rep-kpi-readiness', `${readinessRate}%`);
    setElText('rep-kpi-trips', `${completedTrips} of ${trips.length}`);
    setElText('rep-kpi-distance', `${totalDistance.toLocaleString()} km`);
    setElText('rep-kpi-total-opex', `$${(totalMntCost + totalFuelCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  }

  function renderAllCharts() {
    if (!window.Chart || !window.FleetStorage) return;

    // 1. Monthly Trip Volume Bar Chart
    const tripsCanvas = document.getElementById('report-trips-bar-chart');
    if (tripsCanvas) {
      if (tripsBarChart) tripsBarChart.destroy();
      const ctx = tripsCanvas.getContext('2d');
      tripsBarChart = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov (Current)'],
          datasets: [
            {
              label: 'Patrol Missions',
              data: [142, 168, 185, 174, 192, 210, 155],
              backgroundColor: '#1d4ed8',
              borderRadius: 5
            },
            {
              label: 'Priority 1 Emergency Responses',
              data: [28, 34, 41, 39, 45, 52, 38],
              backgroundColor: '#ef4444',
              borderRadius: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Inter' } } }
          },
          scales: {
            y: { beginAtZero: true, ticks: { font: { family: 'JetBrains Mono' } } },
            x: { ticks: { font: { family: 'Inter' } } }
          }
        }
      });
    }

    // 2. Department Vehicle Distribution Doughnut
    const deptCanvas = document.getElementById('report-dept-chart');
    if (deptCanvas) {
      if (departmentPolarChart) departmentPolarChart.destroy();
      const ctx = deptCanvas.getContext('2d');

      const vehicles = window.FleetStorage.getVehicles();
      const deptCounts = {};
      vehicles.forEach(v => {
        deptCounts[v.department] = (deptCounts[v.department] || 0) + 1;
      });

      departmentPolarChart = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(deptCounts),
          datasets: [{
            data: Object.values(deptCounts),
            backgroundColor: [
              '#1d4ed8',
              '#0ea5e9',
              '#8b5cf6',
              '#f59e0b',
              '#10b981',
              '#ec4899',
              '#64748b'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { position: 'right', labels: { boxWidth: 12, font: { family: 'Inter', size: 11 } } }
          }
        }
      });
    }

    // 3. Maintenance vs Fuel Cost Comparison
    const costCanvas = document.getElementById('report-cost-chart');
    if (costCanvas) {
      if (costComparisonChart) costComparisonChart.destroy();
      const ctx = costCanvas.getContext('2d');

      costComparisonChart = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
          datasets: [
            {
              label: 'Fuel Spend ($)',
              data: [4200, 4850, 5100, 4750, 5400, 3950],
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              fill: true,
              tension: 0.3
            },
            {
              label: 'Maintenance Workshop ($)',
              data: [3100, 2400, 4900, 2800, 3600, 4020],
              borderColor: '#1d4ed8',
              backgroundColor: 'rgba(29, 78, 216, 0.08)',
              fill: true,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              ticks: {
                font: { family: 'JetBrains Mono' },
                callback: v => `$${v}`
              }
            }
          }
        }
      });
    }

    // 4. Response Time Distribution
    const respCanvas = document.getElementById('report-response-time-chart');
    if (respCanvas) {
      if (responseTimeChart) responseTimeChart.destroy();
      const ctx = respCanvas.getContext('2d');

      responseTimeChart = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['< 3 min', '3-5 min', '5-8 min', '8-12 min', '> 12 min'],
          datasets: [{
            label: 'Emergency Calls Dispatched',
            data: [65, 142, 84, 21, 5],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { font: { family: 'JetBrains Mono' } } }
          }
        }
      });
    }
  }

  function setupActions() {
    const btnExportCSV = document.getElementById('btn-export-report-csv');
    if (btnExportCSV) {
      btnExportCSV.addEventListener('click', () => {
        const vehicles = window.FleetStorage.getVehicles();
        const trips = window.FleetStorage.getTrips();
        const exportData = trips.map(t => {
          const veh = vehicles.find(v => v.id === t.vehicleId) || {};
          return {
            TripId: t.id,
            VehicleReg: t.vehicleReg,
            MakeModel: `${veh.make || ''} ${veh.model || ''}`,
            Department: veh.department || '',
            Driver: t.driverName,
            Origin: t.origin,
            Destination: t.destination,
            Departure: `${t.departureDate} ${t.departureTime}`,
            Status: t.status,
            DistanceKm: t.distanceKm || 0
          };
        });
        window.FleetApp.exportToCSV('fleet_operations_analytics_report.csv', exportData);
      });
    }

    const btnPrint = document.getElementById('btn-print-report');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }
  }

  function setElText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  document.addEventListener('DOMContentLoaded', initReports);

})(window);
