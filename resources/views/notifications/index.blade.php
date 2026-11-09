@extends('layouts.app')

@section('title', 'Fleet Alerts & Notification Center - Nigeria Police Force Imo State Command')
@section('header_title', 'Fleet Alerts & Notification Center')
@section('header_subtitle', 'Notifications')

@section('content')
<!-- TOOLBAR -->
<div class="filters-toolbar">
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <span class="status-pill status-available" id="notif-page-count">{{ $unreadCount }} unread</span>
    <select id="notif-filter-type" class="filter-select">
      <option value="ALL">All Alert Categories</option>
      <option value="alert">Emergency / Priority Alerts</option>
      <option value="assignment">Dispatch Assignments</option>
      <option value="maintenance">Maintenance Warnings</option>
      <option value="completed">Completed Missions</option>
      <option value="update">Operational Updates</option>
    </select>
  </div>

  <div class="filter-group">
    <button class="btn btn-secondary btn-sm" id="btn-generate-test-alert">
      <i class="fa-solid fa-bolt"></i> Generate Test Alert
    </button>
    <button class="btn btn-secondary btn-sm" id="btn-mark-all-read">
      <i class="fa-solid fa-check-double"></i> Mark All as Read
    </button>
    <button class="btn btn-danger btn-sm" id="btn-clear-all-notifs">
      <i class="fa-regular fa-trash-can"></i> Clear Feed
    </button>
  </div>
</div>

<!-- NOTIFICATIONS FEED -->
<div id="notifications-full-list" style="display: flex; flex-direction: column; gap: 0.85rem;">
  <!-- Populated by notifications.js from MySQL database -->
</div>
@endsection

@section('scripts')
<script src="{{ asset('js/notifications.js') }}"></script>
@endsection

