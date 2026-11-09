# NIGERIA POLICE FORCE (IMO STATE COMMAND) — FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM

An enterprise-grade Nigeria Police Force Fleet Management and Vehicle Tracking System customized for Imo State Command, built using **HTML5, CSS3, and Vanilla JavaScript**, styled after tactical law enforcement logistics and telematics software.

---

## 🌟 Key Features

1. **Operations Command Dashboard**
   - 6 Dynamic KPI cards: Total Registered Vehicles, Available Units, Active Patrol/Trips, Under Maintenance, Scheduled Dispatches, and Completed Shifts.
   - Interactive 24-hour vehicle activity area/line chart and fleet status doughnut chart using **Chart.js**.
   - Live interactive **Leaflet.js + OpenStreetMap** district radar map with simulated unit telemetry and siren indicators.
   - Quick action triggers for immediate dispatch, vehicle commissioning, officer enrollment, and reporting.

2. **Vehicle Inventory Management**
   - Full CRUD operations: Commission, edit, decommission, and inspect detailed unit dossiers.
   - Multi-parameter filtering (by readiness status, police division, vehicle body class) and real-time search.
   - Fuel level gauges, odometer readings, and VIN tracking with **JetBrains Mono** registration plate badges.

3. **Authorized Driver & Officer Roster**
   - Officer profiles with Badge IDs, ranks, division assignments, EVOC certifications, and assigned cruisers.
   - Real-time duty readiness tracking (`On Duty`, `Off Duty`, `On Leave`).
   - Modal-based officer dossiers and CSV export.

4. **Live Radar & GPS Telematics Tracking**
   - Full-viewport interactive **OpenStreetMap** with custom police cruisers, SUVs, K-9 units, SWAT BearCats, and motorcycles.
   - Live simulated GPS movement along realistic city patrol sectors (clearly marked **DEMO DATA**).
   - Real-time telemetry drawer showing speed, compass heading, battery voltage, fuel percentage, and emergency siren toggle.

5. **Trip Assignments & Dispatch Orders**
   - Form validation with automatically generated Trip IDs (`TRP-XXXX`).
   - Dynamic protection against assigning unavailable vehicles or off-duty personnel.
   - Live synchronization with vehicle status, driver roster, notification alerts, and dashboard KPIs.

6. **Trip History & Manifest Archive**
   - Complete historical log of all missions, destinations, distances, and timestamps.
   - Sorting by date or distance, filtering, real CSV file download, and print-ready manifest styling.

7. **Fleet Alerts & Notification Center**
   - Real-time notification feed covering pursuit sirens, dispatch assignments, maintenance milestones, and shift completions.
   - Dynamic unread badge counter in the top navigation, "Mark All as Read", and test alert generator.

8. **Maintenance & Workshop Scheduling**
   - Work order logging for brake overhauls, 10,000-mile services, siren repairs, and armor inspections.
   - Workshop bay tracking (`In Progress`, `Pending`, `Completed`) with automatic vehicle availability syncing.

9. **Fuel Expenditure & Efficiency Analytics**
   - Fuel slip logging with volume, price per litre, total cost, odometer tracking, and station pump numbers.
   - Chart.js breakdown of fuel consumption across fleet registration numbers.

10. **Operational Intelligence & Reports**
    - High-level executive charts: Monthly mission volume, division fleet distribution, OPEX cost comparison (fuel vs maintenance), and emergency 10-33 response time curves.
    - Export to CSV and clean printable layout.

11. **System & Terminal Settings**
    - Commander profile editing, theme selection (Light Command vs Dark Tactical), speed units (MPH vs km/h), and storage stats.
    - One-click factory reset back to initial demo seeds and full JSON database backup.

12. **Pure Vanilla Architecture & LocalStorage Persistence**
    - Zero heavy frameworks (No React, Vue, Angular, Bootstrap, or Tailwind).
    - 100% persistent state in browser `localStorage`.
    - No external database or backend required.

---

## 🛠️ Technologies Used

- **HTML5**: Semantic, accessible markup across 12 distinct pages.
- **CSS3**: Custom properties (CSS variables), responsive flexbox and grid layouts, subtle shadows, and animations.
- **Vanilla JavaScript (ES6+)**: Modular code with `FleetStorage` and `FleetApp` reusable namespaces.
- **Font Awesome 6 (CDN)**: Vector icons for police badges, vehicles, sirens, and telemetry indicators.
- **Google Fonts (CDN)**:
  - *Inter*: Core application typography.
  - *Manrope*: Bold authoritative headers.
  - *JetBrains Mono*: Vehicle license plates, trip IDs, and telemetry coordinates.
- **Chart.js (CDN)**: Interactive charts for operational activity, status distribution, fuel, and response metrics.
- **Leaflet.js & OpenStreetMap (CDN)**: Interactive maps with custom HTML vehicle markers and popups.
- **LocalStorage**: Persistent client-side data store pre-seeded with 12 vehicles, 10 drivers, 8 trips, 8 alerts, 6 maintenance records, and 8 fuel slips.

---

## 📂 Project Directory Structure

```text
police-fleet-system/
├── index.html              # Login & Demonstration Access Portal
├── dashboard.html          # Main Operations Command Dashboard
├── vehicles.html           # Vehicle Inventory & Commissioning
├── drivers.html            # Authorized Driver & Officer Roster
├── tracking.html           # Live Radar & Simulated Telematics Map
├── trips.html              # Trip Assignments & Dispatch Order Form
├── trip-history.html       # Trip History Manifest & Log Archive
├── notifications.html      # Fleet Alerts & Notification Feed
├── maintenance.html        # Maintenance & Workshop Service Schedule
├── fuel.html               # Fuel Expenditure & Efficiency
├── reports.html            # Reports & Operational Intelligence
├── settings.html           # System & Terminal Settings
├── css/
│   ├── style.css           # Master CSS design system
│   └── responsive.css      # Tablet & mobile responsive styles
├── js/
│   ├── storage.js          # LocalStorage data layer & CRUD API
│   ├── app.js              # Core UI utilities, badges, modals, toasts, clock
│   ├── dashboard.js        # Dashboard KPIs, charts, and mini-map
│   ├── vehicles.js         # Vehicle inventory controller
│   ├── drivers.js          # Officer roster controller
│   ├── tracking.js         # Leaflet GPS tracking & simulation
│   ├── trips.js            # Dispatch assignments controller
│   ├── trip-history.js     # History log, search, and CSV export
│   ├── notifications.js    # Notification feed and alerts
│   ├── maintenance.js      # Workshop service orders controller
│   ├── fuel.js             # Fuel logs and consumption charts
│   ├── reports.js          # Operational reporting charts
│   └── settings.js         # Terminal settings & demo reset
└── README.md               # Documentation and technical guide
```

---

## 🚀 How to Run Locally

1. Simply open `index.html` or `dashboard.html` in any modern web browser (Google Chrome, Firefox, Safari, Microsoft Edge).
2. Or serve via any static web server:
   ```bash
   # Python 3
   python3 -m http.server 3000

   # Node.js npx
   npx serve .
   ```
3. Demonstration Login Credentials:
   - **Badge ID / Email:** `commander@metropolice.gov`
   - **Access Code:** `SENTINEL-911` (or click "Quick Login")

---

## ⚠️ Disclaimer
All vehicle positions, speeds, callsigns, badge numbers, and patrol routes are **FICTIONAL DEMONSTRATION DATA (DEMO DATA)** created for user interface presentation purposes. This application does not claim or use real GPS satellites or official government law enforcement databases.
