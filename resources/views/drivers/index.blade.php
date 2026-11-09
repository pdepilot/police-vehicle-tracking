@extends('layouts.app')

@section('title', 'Officer & Driver Roster - Nigeria Police Force Imo State Command')
@section('header_title', 'Authorized Officer & Driver Roster')
@section('header_subtitle', 'Drivers')

@section('content')
<!-- SEARCH & FILTERS TOOLBAR -->
<div class="filters-toolbar">
  <div class="search-box">
    <i class="fa-solid fa-magnifying-glass"></i>
    <input type="text" id="driver-search-input" class="search-input" placeholder="Search officer by name, badge #, rank, division..." />
  </div>

  <div class="filter-group">
    <select id="driver-filter-status" class="filter-select">
      <option value="ALL">All Duty Statuses</option>
      <option value="On Duty">On Duty (Available for Call)</option>
      <option value="Off Duty">Off Duty</option>
      <option value="On Leave">On Leave</option>
    </select>

    <select id="driver-filter-department" class="filter-select">
      <option value="ALL">All Divisions</option>
      <option value="Patrol Division">Patrol Division</option>
      <option value="Highway Patrol">Highway Patrol</option>
      <option value="SWAT / Special Ops">SWAT / Special Ops</option>
      <option value="K-9 Tactical Unit">K-9 Tactical Unit</option>
      <option value="Marine & Harbor Unit">Marine & Harbor Unit</option>
      <option value="Traffic Bureau">Traffic Bureau</option>
      <option value="Criminal Investigation">Criminal Investigation</option>
      <option value="Detention Bureau">Detention Bureau</option>
    </select>

    <button class="btn btn-secondary btn-sm" id="btn-export-drivers-csv" title="Export Officer Roster to CSV">
      <i class="fa-solid fa-file-csv"></i> Export CSV
    </button>

    <button class="btn btn-primary" id="btn-open-add-driver">
      <i class="fa-solid fa-user-plus"></i> Enroll Officer
    </button>
  </div>
</div>

<!-- ROSTER STATUS HEADER -->
<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
  <h2 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: var(--text-main);">
    <i class="fa-solid fa-id-card-clip" style="color: var(--primary);"></i> Certified EVOC Drivers & Tactical Operators
  </h2>
  <span class="status-pill status-available" id="drivers-count-badge">Loading roster...</span>
</div>

<!-- DRIVER ROSTER GRID -->
<div class="stats-grid" id="drivers-grid-container" style="grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));">
  <!-- Populated by drivers.js from MySQL database -->
</div>

<!-- MODAL: ADD / EDIT DRIVER -->
<div class="modal-overlay" id="driver-crud-modal">
  <div class="modal-box lg">
    <div class="modal-header">
      <h3 class="modal-title" id="driver-modal-title">
        <i class="fa-solid fa-user-plus text-blue-600"></i> Enroll Officer
      </h3>
      <button class="modal-close-btn" onclick="FleetApp.closeModal('driver-crud-modal')">&times;</button>
    </div>
    <form id="driver-modal-form">
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required" for="form-drv-badge">Police Badge Number</label>
            <input type="text" id="form-drv-badge" class="form-control" required placeholder="e.g. 4821" style="font-family: var(--font-mono);" />
          </div>

          <div class="form-group">
            <label class="form-label required" for="form-drv-rank">Rank / Title</label>
            <select id="form-drv-rank" class="form-control">
              <option value="Officer">Officer</option>
              <option value="Senior Officer">Senior Officer</option>
              <option value="Corporal">Corporal</option>
              <option value="Sergeant">Sergeant</option>
              <option value="Lieutenant">Lieutenant</option>
              <option value="Detective">Detective</option>
              <option value="K-9 Specialist">K-9 Specialist</option>
              <option value="Motor Officer">Motor Officer</option>
              <option value="Transport Officer">Transport Officer</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label required" for="form-drv-firstname">First Name</label>
            <input type="text" id="form-drv-firstname" class="form-control" required placeholder="e.g. Marcus" />
          </div>

          <div class="form-group">
            <label class="form-label required" for="form-drv-lastname">Last Name</label>
            <input type="text" id="form-drv-lastname" class="form-control" required placeholder="e.g. Cole" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-drv-dept">Assigned Division</label>
            <select id="form-drv-dept" class="form-control">
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
            <label class="form-label" for="form-drv-status">Duty Readiness Status</label>
            <select id="form-drv-status" class="form-control">
              <option value="On Duty">On Duty (Available for Dispatch)</option>
              <option value="Off Duty">Off Duty</option>
              <option value="On Leave">On Leave / Training</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-drv-phone">Dispatch Contact Phone</label>
            <input type="text" id="form-drv-phone" class="form-control" placeholder="(0803) 919-4821" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-drv-email">Official Police Email</label>
            <input type="email" id="form-drv-email" class="form-control" placeholder="m.cole@police.gov.ng" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-drv-license">Driver License Classification</label>
            <select id="form-drv-license" class="form-control">
              <option value="Class C Standard">Class C Standard</option>
              <option value="Class C Commercial">Class C Commercial</option>
              <option value="Class B Heavy Endorsement">Class B Heavy (Armored/Bus)</option>
              <option value="Class A Commercial">Class A Commercial</option>
              <option value="Class M Motorcycle Certified">Class M Motorcycle</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-drv-evoc">EVOC Certification Level</label>
            <select id="form-drv-evoc" class="form-control">
              <option value="EVOC Level 1 Standard">EVOC Level 1 Standard</option>
              <option value="EVOC Level 2 Specialist">EVOC Level 2 Specialist</option>
              <option value="EVOC High-Speed Specialist">EVOC High-Speed Specialist</option>
              <option value="EVOC Master Instructor">EVOC Master Instructor</option>
              <option value="Tactical Armored Master">Tactical Armored Master</option>
              <option value="Police Motorcycle Master">Police Motorcycle Master</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-drv-vehicle">Permanently Assigned Cruiser</label>
            <select id="form-drv-vehicle" class="form-control">
              <!-- Populated dynamically -->
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-drv-years">Years of Department Service</label>
            <input type="number" id="form-drv-years" class="form-control" value="5" min="1" max="40" />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="FleetApp.closeModal('driver-crud-modal')">Cancel</button>
        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Officer Record</button>
      </div>
    </form>
  </div>
</div>

<!-- MODAL: VIEW OFFICER DOSSIER -->
<div class="modal-overlay" id="driver-dossier-modal">
  <div class="modal-box">
    <div class="modal-header">
      <h3 class="modal-title">
        <i class="fa-solid fa-user-shield text-blue-600"></i> Officer Dossier: <span id="dossier-badge" style="font-family: var(--font-mono); margin-left: 6px; color: var(--primary);">BADGE #0000</span>
      </h3>
      <button class="modal-close-btn" onclick="FleetApp.closeModal('driver-dossier-modal')">&times;</button>
    </div>
    <div class="modal-body">
      <div style="display: flex; gap: 1rem; align-items: center; background: var(--bg-card-subtle); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 1.25rem;">
        <div class="user-avatar" style="width: 52px; height: 52px; font-size: 1.4rem;">
          <i class="fa-solid fa-user"></i>
        </div>
        <div>
          <h4 id="dossier-name" style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: var(--text-main);">Officer Name</h4>
          <div style="font-size: 0.8rem; color: var(--text-muted);"><span id="dossier-dept">Patrol Division</span> &bull; <span id="dossier-status" style="font-weight: 700; color: #16a34a;">On Duty</span></div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.82rem; margin-bottom: 1.25rem;">
        <div><strong>Dispatch Phone:</strong> <span id="dossier-phone"></span></div>
        <div><strong>Department Email:</strong> <span id="dossier-email"></span></div>
        <div><strong>License Class:</strong> <span id="dossier-license"></span></div>
        <div><strong>EVOC Level:</strong> <span id="dossier-evoc"></span></div>
        <div><strong>Service Record:</strong> <span id="dossier-years"></span></div>
        <div><strong>Assigned Cruiser:</strong> <span id="dossier-vehicle" class="plate-badge"></span></div>
      </div>

      <div>
        <strong style="font-size: 0.82rem; display: block; margin-bottom: 0.5rem;"><i class="fa-solid fa-certificate text-blue-600"></i> Verified Tactical Certifications:</strong>
        <div id="dossier-certs-list" style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
          <!-- Populated -->
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary btn-sm" onclick="FleetApp.closeModal('driver-dossier-modal')">Close Dossier</button>
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script src="{{ asset('js/drivers.js') }}"></script>
@endsection

