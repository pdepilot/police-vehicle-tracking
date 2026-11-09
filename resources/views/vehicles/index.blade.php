@extends('layouts.app')

@section('title', 'Police Vehicle Inventory - Nigeria Police Force Imo State Command')
@section('header_title', 'Police Vehicle Inventory')
@section('header_subtitle', 'Vehicles')

@section('content')
<!-- SEARCH & FILTERS TOOLBAR -->
<div class="filters-toolbar">
  <div class="search-box">
    <i class="fa-solid fa-magnifying-glass"></i>
    <input type="text" id="vehicle-search-input" class="search-input" placeholder="Search plate, callsign, model, officer, VIN..." />
  </div>

  <div class="filter-group">
    <select id="vehicle-filter-status" class="filter-select">
      <option value="ALL">All Statuses</option>
      <option value="Available">Available</option>
      <option value="On Trip">On Trip / Patrol</option>
      <option value="Maintenance">Maintenance</option>
      <option value="Out of Service">Out of Service</option>
    </select>

    <select id="vehicle-filter-department" class="filter-select">
      <option value="ALL">All Divisions</option>
      <option value="Patrol Division">Patrol Division</option>
      <option value="Highway Patrol">Highway Patrol</option>
      <option value="SWAT / Special Ops">SWAT / Special Ops</option>
      <option value="K-9 Tactical Unit">K-9 Tactical Unit</option>
      <option value="Marine & Harbor Unit">Marine & Harbor</option>
      <option value="Traffic Bureau">Traffic Bureau</option>
      <option value="Criminal Investigation">Criminal Investigation</option>
      <option value="Detention Bureau">Detention Bureau</option>
    </select>

    <select id="vehicle-filter-type" class="filter-select">
      <option value="ALL">All Vehicle Types</option>
      <option value="SUV">SUV (Pursuit Utility)</option>
      <option value="Sedan">Sedan (Charger / Interceptor)</option>
      <option value="Armored Tactical">Armored Tactical (BearCat)</option>
      <option value="Truck">Truck (F-150 Responder)</option>
      <option value="Motorcycle">Motorcycle (BMW RT-P)</option>
      <option value="Van">Van (Prisoner Transit)</option>
    </select>

    <button class="btn btn-secondary btn-sm" id="btn-export-vehicles-csv" title="Export Inventory to CSV">
      <i class="fa-solid fa-file-csv"></i> Export CSV
    </button>

    <button class="btn btn-primary" id="btn-open-add-vehicle">
      <i class="fa-solid fa-plus-circle"></i> Commission Vehicle
    </button>
  </div>
</div>

<!-- VEHICLES TABLE CARD -->
<div class="content-card">
  <div class="card-header">
    <div class="card-title-group">
      <h2 class="card-title">
        <i class="fa-solid fa-shield text-blue-600"></i> Commissioned Fleet Inventory
      </h2>
      <span class="card-subtitle" id="vehicles-count-badge">Loading inventory...</span>
    </div>
  </div>
  <div class="card-body no-padding">
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Registration & Call Sign</th>
            <th>Make, Model & Year</th>
            <th>Division</th>
            <th>Assigned Officer</th>
            <th>Fuel Level</th>
            <th>Odometer</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="vehicles-table-tbody">
          <!-- Rendered dynamically by vehicles.js from MySQL database -->
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- MODAL: ADD / EDIT VEHICLE -->
<div class="modal-overlay" id="vehicle-crud-modal">
  <div class="modal-box lg">
    <div class="modal-header">
      <h3 class="modal-title" id="vehicle-modal-title">
        <i class="fa-solid fa-car text-blue-600"></i> Commission Vehicle
      </h3>
      <button class="modal-close-btn" onclick="FleetApp.closeModal('vehicle-crud-modal')">&times;</button>
    </div>
    <form id="vehicle-modal-form">
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required" for="form-veh-registration">Plate Registration Number</label>
            <input type="text" id="form-veh-registration" class="form-control" required placeholder="e.g. POL-4021" style="font-family: var(--font-mono); text-transform: uppercase;" />
          </div>

          <div class="form-group">
            <label class="form-label required" for="form-veh-callsign">Radio Call Sign</label>
            <input type="text" id="form-veh-callsign" class="form-control" required placeholder="e.g. Alpha-04, Interceptor-02" />
          </div>

          <div class="form-group">
            <label class="form-label required" for="form-veh-make">Vehicle Make</label>
            <input type="text" id="form-veh-make" class="form-control" required placeholder="e.g. Ford, Dodge, Chevrolet" />
          </div>

          <div class="form-group">
            <label class="form-label required" for="form-veh-model">Vehicle Model</label>
            <input type="text" id="form-veh-model" class="form-control" required placeholder="e.g. Police Interceptor Utility" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-veh-year">Model Year</label>
            <input type="number" id="form-veh-year" class="form-control" value="2024" min="2015" max="2027" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-veh-type">Vehicle Class / Body</label>
            <select id="form-veh-type" class="form-control">
              <option value="SUV">SUV (Pursuit Utility)</option>
              <option value="Sedan">Sedan (Charger Pursuit)</option>
              <option value="Armored Tactical">Armored Tactical (BearCat)</option>
              <option value="Truck">Truck (Responder 4x4)</option>
              <option value="Motorcycle">Motorcycle (Police RT-P)</option>
              <option value="Van">Van (Prisoner Transport)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-veh-dept">Assigned Police Division</label>
            <select id="form-veh-dept" class="form-control">
              <option value="Patrol Division">Patrol Division</option>
              <option value="Highway Patrol">Highway Patrol</option>
              <option value="SWAT / Special Ops">SWAT / Special Ops</option>
              <option value="K-9 Tactical Unit">K-9 Tactical Unit</option>
              <option value="Marine & Harbor Unit">Marine & Harbor Unit</option>
              <option value="Traffic Bureau">Traffic Bureau</option>
              <option value="Criminal Investigation">Criminal Investigation</option>
              <option value="Detention Bureau">Detention Bureau</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-veh-driver">Assigned Officer / Driver</label>
            <select id="form-veh-driver" class="form-control">
              <!-- Dynamically populated -->
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-veh-status">Current Readiness Status</label>
            <select id="form-veh-status" class="form-control">
              <option value="Available">Available (Standby at Station)</option>
              <option value="On Trip">On Trip / Active Patrol</option>
              <option value="Maintenance">Maintenance (Workshop)</option>
              <option value="Out of Service">Out of Service</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-veh-mileage">Odometer Reading (km)</label>
            <input type="number" id="form-veh-mileage" class="form-control" value="15000" min="0" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-veh-fuel">Current Fuel / Battery %</label>
            <input type="number" id="form-veh-fuel" class="form-control" value="100" min="0" max="100" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-veh-vin">Chassis VIN Number</label>
            <input type="text" id="form-veh-vin" class="form-control" placeholder="1FAHP2K89NA..." style="font-family: var(--font-mono); text-transform: uppercase;" />
          </div>

          <div class="form-group full-width">
            <label class="form-label" for="form-veh-location">Primary Staging Location / Bay</label>
            <input type="text" id="form-veh-location" class="form-control" placeholder="Command Headquarters, Owerri, Bay 3" />
          </div>

          <div class="form-group full-width">
            <label class="form-label" for="form-veh-notes">Tactical Equipment & Mod Notes</label>
            <textarea id="form-veh-notes" class="form-control" rows="2" placeholder="e.g. Whelen lightbar, dual spotlight, B7 ballistic protection..."></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="FleetApp.closeModal('vehicle-crud-modal')">Cancel</button>
        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Vehicle Record</button>
      </div>
    </form>
  </div>
</div>

<!-- MODAL: VIEW VEHICLE DOSSIER -->
<div class="modal-overlay" id="vehicle-details-modal">
  <div class="modal-box lg">
    <div class="modal-header">
      <h3 class="modal-title">
        <i class="fa-solid fa-car text-blue-600"></i> Vehicle Dossier: <span id="modal-detail-reg" class="plate-badge" style="margin-left: 8px;">POL-0000</span>
      </h3>
      <button class="modal-close-btn" onclick="FleetApp.closeModal('vehicle-details-modal')">&times;</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="modal-detail-veh-id" />
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; background: var(--bg-card-subtle); padding: 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Call Sign</span>
          <strong id="modal-detail-callsign" style="font-size: 1.1rem; color: var(--primary);">Unit</strong>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Make & Model</span>
          <strong id="modal-detail-makemodel" style="font-size: 1rem;">Ford Interceptor</strong>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Division</span>
          <strong id="modal-detail-dept" style="font-size: 1rem;">Patrol Division</strong>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Vehicle Class</span>
          <strong id="modal-detail-type">SUV</strong>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Assigned Officer</span>
          <strong id="modal-detail-driver">Officer Name</strong>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Quick Status Update</span>
          <select id="modal-detail-status-select" class="form-control" style="padding: 3px 8px; font-size: 0.78rem; font-weight: 600;">
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Out of Service">Out of Service</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        <div class="stat-card">
          <span class="stat-label">Odometer</span>
          <div class="stat-value" id="modal-detail-mileage" style="font-size: 1.25rem;">0 km</div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Fuel Level</span>
          <div class="stat-value" id="modal-detail-fuel" style="font-size: 1.25rem; color: #16a34a;">0%</div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Aux Battery</span>
          <div class="stat-value" id="modal-detail-battery" style="font-size: 1.25rem; color: #3b82f6;">98%</div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Next Service Due</span>
          <div class="stat-value" id="modal-detail-nextservice" style="font-size: 1.05rem;">TBD</div>
        </div>
      </div>

      <div style="font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.5rem;">
        <div><strong>Chassis VIN:</strong> <span id="modal-detail-vin" style="font-family: var(--font-mono);"></span></div>
        <div><strong>Staging Location:</strong> <span id="modal-detail-location"></span></div>
        <div><strong>Last Logged Service:</strong> <span id="modal-detail-lastservice"></span></div>
        <div style="margin-top: 0.5rem; background: rgba(59, 130, 246, 0.1); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid rgba(59, 130, 246, 0.2);">
          <strong><i class="fa-solid fa-circle-info text-blue-600"></i> Equipment Notes:</strong>
          <p id="modal-detail-notes" style="margin-top: 4px; color: var(--text-secondary);"></p>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <a id="modal-detail-track-btn" href="{{ route('tracking.index') }}" class="btn btn-primary btn-sm">
        <i class="fa-solid fa-location-crosshairs"></i> View on Live Radar
      </a>
      <button type="button" class="btn btn-secondary btn-sm" onclick="FleetApp.closeModal('vehicle-details-modal')">Close Dossier</button>
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script src="{{ asset('js/vehicles.js') }}"></script>
@endsection

