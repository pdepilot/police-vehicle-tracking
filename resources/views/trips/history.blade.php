@extends('layouts.app')

@section('title', 'Trip History & Manifest Archive - Nigeria Police Force Imo State Command')
@section('header_title', 'Trip History & Patrol Manifests')
@section('header_subtitle', 'Manifest Archive')

@section('content')
<!-- SEARCH & FILTERS TOOLBAR -->
<div class="filters-toolbar">
  <div class="search-box">
    <i class="fa-solid fa-magnifying-glass"></i>
    <input type="text" id="history-search-input" class="search-input" placeholder="Search manifest by Trip ID, vehicle, officer, destination..." />
  </div>

  <div class="filter-group">
    <select id="history-filter-status" class="filter-select">
      <option value="ALL">All Mission Statuses</option>
      <option value="Completed">Completed Missions</option>
      <option value="Active">Active Dispatches</option>
      <option value="Scheduled">Scheduled</option>
      <option value="Cancelled">Cancelled</option>
    </select>

    <select id="history-sort-by" class="filter-select">
      <option value="date_desc">Sort: Newest First</option>
      <option value="date_asc">Sort: Oldest First</option>
      <option value="distance_desc">Sort: Longest Distance</option>
    </select>

    <button class="btn btn-secondary btn-sm" id="btn-export-history-csv" title="Export Manifests to CSV">
      <i class="fa-solid fa-file-csv"></i> Export CSV
    </button>

    <button class="btn btn-secondary btn-sm" id="btn-print-history" title="Print Manifests" onclick="window.print()">
      <i class="fa-solid fa-print"></i> Print Manifest
    </button>
  </div>
</div>

<!-- TRIP HISTORY TABLE CARD -->
<div class="content-card">
  <div class="card-header">
    <div class="card-title-group">
      <h2 class="card-title">
        <i class="fa-solid fa-clipboard-check text-blue-600"></i> Official Trip Log & Manifest Archive
      </h2>
      <span class="card-subtitle" id="history-count-badge">Loading archive...</span>
    </div>
  </div>
  <div class="card-body no-padding">
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Trip ID</th>
            <th>Vehicle</th>
            <th>Driver / Officer</th>
            <th>Origin</th>
            <th>Destination & Purpose</th>
            <th>Departure / Return</th>
            <th>Distance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="history-table-tbody">
          <!-- Rendered dynamically by trip-history.js from MySQL database -->
        </tbody>
      </table>
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script src="{{ asset('js/trip-history.js') }}"></script>
@endsection

