/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SENTINEL FLEET — POLICE FLEET MANAGEMENT & VEHICLE TRACKING SYSTEM
 * Storage Module (Vanilla JavaScript + LocalStorage)
 */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    VEHICLES: 'police_fleet_vehicles',
    DRIVERS: 'police_fleet_drivers',
    TRIPS: 'police_fleet_trips',
    MAINTENANCE: 'police_fleet_maintenance',
    FUEL: 'police_fleet_fuel',
    NOTIFICATIONS: 'police_fleet_notifications',
    SETTINGS: 'police_fleet_settings',
    AUTH: 'police_fleet_auth_session'
  };

  // Seed Data: 12 Detailed Fictional Police Vehicles
  const INITIAL_VEHICLES = [
    {
      id: 'VEH-101',
      registration: 'POL-2041',
      callSign: 'Alpha-01',
      vin: '1FAHP2K89NA104921',
      make: 'Ford',
      model: 'Police Interceptor Utility',
      year: 2023,
      type: 'SUV',
      department: 'Patrol Division',
      assignedDriverId: 'DRV-01',
      assignedDriverName: 'Sgt. Marcus Cole',
      status: 'Available',
      mileage: 24120,
      fuelLevel: 85,
      fuelCapacity: 75,
      batteryLevel: 98,
      lat: 37.7749,
      lng: -122.4194,
      speed: 0,
      heading: 'NE',
      sirenActive: false,
      lastServiceDate: '2026-09-12',
      nextServiceDate: '2027-01-15',
      lastLocation: 'Metro Central Precinct, Bay 4',
      notes: 'Equipped with front push bumper and dual spotlight package.'
    },
    {
      id: 'VEH-102',
      registration: 'INT-8832',
      callSign: 'Interceptor-04',
      vin: '2C3CDXAT5PH591024',
      make: 'Dodge',
      model: 'Charger Pursuit V8',
      year: 2024,
      type: 'Sedan',
      department: 'Highway Patrol',
      assignedDriverId: 'DRV-02',
      assignedDriverName: 'Officer Elena Rostova',
      status: 'On Trip',
      mileage: 14800,
      fuelLevel: 65,
      fuelCapacity: 70,
      batteryLevel: 94,
      lat: 37.7840,
      lng: -122.4080,
      speed: 48,
      heading: 'NW',
      sirenActive: true,
      lastServiceDate: '2026-10-01',
      nextServiceDate: '2027-02-01',
      lastLocation: 'Expressway Route 101 N, Milepost 4',
      notes: 'High-speed intercept radar and dual in-car automated license plate reader.'
    },
    {
      id: 'VEH-103',
      registration: 'SWAT-09',
      callSign: 'Titan-01',
      vin: '1GBHG31K711892011',
      make: 'Lenco',
      model: 'BearCat G3 Armored',
      year: 2022,
      type: 'Armored Tactical',
      department: 'SWAT / Special Ops',
      assignedDriverId: 'DRV-03',
      assignedDriverName: 'Lt. David Miller',
      status: 'Available',
      mileage: 8350,
      fuelLevel: 92,
      fuelCapacity: 140,
      batteryLevel: 100,
      lat: 37.7650,
      lng: -122.4310,
      speed: 0,
      heading: 'S',
      sirenActive: false,
      lastServiceDate: '2026-08-20',
      nextServiceDate: '2026-12-10',
      lastLocation: 'Tactical Operations Staging Depot',
      notes: 'Mil-spec B7 ballistic steel armor and roof hatch surveillance turret.'
    },
    {
      id: 'VEH-104',
      registration: 'K9-3011',
      callSign: 'K9-Unit-3',
      vin: '1GNSCKED0PR309118',
      make: 'Chevrolet',
      model: 'Tahoe Police Pursuit (PPV)',
      year: 2023,
      type: 'SUV',
      department: 'K-9 Tactical Unit',
      assignedDriverId: 'DRV-04',
      assignedDriverName: 'Officer Sarah Jenkins',
      status: 'On Trip',
      mileage: 31400,
      fuelLevel: 45,
      fuelCapacity: 98,
      batteryLevel: 91,
      lat: 37.7915,
      lng: -122.4050,
      speed: 24,
      heading: 'E',
      sirenActive: false,
      lastServiceDate: '2026-09-05',
      nextServiceDate: '2026-12-28',
      lastLocation: 'Financial District, Sector 2',
      notes: 'Custom canine kennel with remote climate-control fail-safe system.'
    },
    {
      id: 'VEH-105',
      registration: 'POL-1088',
      callSign: 'Marine-02',
      vin: '1FTFW1ED4NFC92019',
      make: 'Ford',
      model: 'F-150 Police Responder 4x4',
      year: 2023,
      type: 'Truck',
      department: 'Marine & Harbor Unit',
      assignedDriverId: 'DRV-05',
      assignedDriverName: 'Officer Tyler Vance',
      status: 'Available',
      mileage: 19250,
      fuelLevel: 78,
      fuelCapacity: 100,
      batteryLevel: 96,
      lat: 37.8050,
      lng: -122.4220,
      speed: 0,
      heading: 'N',
      sirenActive: false,
      lastServiceDate: '2026-09-18',
      nextServiceDate: '2027-01-20',
      lastLocation: 'Pier 39 Marine Operations Dock',
      notes: 'Equipped with heavy-duty boat trailer hitch and emergency winch.'
    },
    {
      id: 'VEH-106',
      registration: 'TRAF-550',
      callSign: 'Motor-05',
      vin: 'WB10J9102PZ449182',
      make: 'BMW',
      model: 'R1250RT-P Police Edition',
      year: 2024,
      type: 'Motorcycle',
      department: 'Traffic Bureau',
      assignedDriverId: 'DRV-06',
      assignedDriverName: 'Officer Carlos Mendez',
      status: 'Available',
      mileage: 6400,
      fuelLevel: 82,
      fuelCapacity: 25,
      batteryLevel: 99,
      lat: 37.7700,
      lng: -122.4100,
      speed: 0,
      heading: 'W',
      sirenActive: false,
      lastServiceDate: '2026-10-15',
      nextServiceDate: '2027-02-15',
      lastLocation: 'Traffic Enforcement Substation South',
      notes: 'Equipped with handheld lidar gun and blue strobe fairing lights.'
    },
    {
      id: 'VEH-107',
      registration: 'CID-7740',
      callSign: 'Echo-07',
      vin: '3FA6P0SU9HR201934',
      make: 'Ford',
      model: 'Fusion Hybrid (Unmarked)',
      year: 2022,
      type: 'Sedan',
      department: 'Criminal Investigation',
      assignedDriverId: 'DRV-07',
      assignedDriverName: 'Det. Rachel Adams',
      status: 'Available',
      mileage: 42100,
      fuelLevel: 58,
      fuelCapacity: 53,
      batteryLevel: 88,
      lat: 37.7800,
      lng: -122.4400,
      speed: 0,
      heading: 'SW',
      sirenActive: false,
      lastServiceDate: '2026-08-30',
      nextServiceDate: '2026-12-15',
      lastLocation: 'District Attorney Court Complex',
      notes: 'Covert visor lights and covert digital secure radio system.'
    },
    {
      id: 'VEH-108',
      registration: 'POL-9921',
      callSign: 'Bravo-03',
      vin: '1C4RDJDG2PC619028',
      make: 'Dodge',
      model: 'Durango Pursuit AWD',
      year: 2023,
      type: 'SUV',
      department: 'Patrol Division',
      assignedDriverId: '',
      assignedDriverName: 'Unassigned',
      status: 'Maintenance',
      mileage: 38900,
      fuelLevel: 32,
      fuelCapacity: 93,
      batteryLevel: 85,
      lat: 37.7550,
      lng: -122.4180,
      speed: 0,
      heading: 'N',
      sirenActive: false,
      lastServiceDate: '2026-11-02',
      nextServiceDate: '2026-11-08',
      lastLocation: 'Metro Fleet Repair Depot, Bay 2',
      notes: 'Brake pads, rotor replacement and steering calibration in progress.'
    },
    {
      id: 'VEH-109',
      registration: 'INT-4410',
      callSign: 'Interceptor-09',
      vin: '2C3CDXAT8NH491823',
      make: 'Dodge',
      model: 'Charger Pursuit V8',
      year: 2023,
      type: 'Sedan',
      department: 'Highway Patrol',
      assignedDriverId: 'DRV-08',
      assignedDriverName: 'Officer Liam Chen',
      status: 'Available',
      mileage: 28150,
      fuelLevel: 72,
      fuelCapacity: 70,
      batteryLevel: 93,
      lat: 37.7620,
      lng: -122.3950,
      speed: 0,
      heading: 'E',
      sirenActive: false,
      lastServiceDate: '2026-09-22',
      nextServiceDate: '2027-01-20',
      lastLocation: 'Highway Patrol Outpost East',
      notes: 'Pit bumper reinforcement verified.'
    },
    {
      id: 'VEH-110',
      registration: 'VAN-202',
      callSign: 'Transport-02',
      vin: '1FTBR1Y88NKA19204',
      make: 'Ford',
      model: 'Transit 350HD Prisoner Van',
      year: 2021,
      type: 'Van',
      department: 'Detention Bureau',
      assignedDriverId: 'DRV-09',
      assignedDriverName: "Officer James O'Connor",
      status: 'On Trip',
      mileage: 53200,
      fuelLevel: 50,
      fuelCapacity: 95,
      batteryLevel: 89,
      lat: 37.7880,
      lng: -122.4280,
      speed: 31,
      heading: 'S',
      sirenActive: false,
      lastServiceDate: '2026-08-14',
      nextServiceDate: '2026-12-01',
      lastLocation: 'County Jail Facility Access Road',
      notes: 'Dual partition 8-cell secured lockup module.'
    },
    {
      id: 'VEH-111',
      registration: 'POL-3315',
      callSign: 'Alpha-08',
      vin: '1FAHP2K85PA193822',
      make: 'Ford',
      model: 'Police Interceptor Utility',
      year: 2024,
      type: 'SUV',
      department: 'Patrol Division',
      assignedDriverId: 'DRV-10',
      assignedDriverName: 'Officer Maya Lin',
      status: 'Available',
      mileage: 11200,
      fuelLevel: 94,
      fuelCapacity: 75,
      batteryLevel: 99,
      lat: 37.7720,
      lng: -122.4350,
      speed: 0,
      heading: 'W',
      sirenActive: false,
      lastServiceDate: '2026-10-10',
      nextServiceDate: '2027-02-15',
      lastLocation: 'Western District Station',
      notes: 'New generation all-wheel drive tactical response vehicle.'
    },
    {
      id: 'VEH-112',
      registration: 'TRU-604',
      callSign: 'Command-01',
      vin: '1FVACXDT2MH910245',
      make: 'Freightliner',
      model: 'M2 106 Mobile Command Post',
      year: 2020,
      type: 'Heavy Command',
      department: 'Command Staff',
      assignedDriverId: '',
      assignedDriverName: 'Unassigned',
      status: 'Available',
      mileage: 18700,
      fuelLevel: 85,
      fuelCapacity: 300,
      batteryLevel: 97,
      lat: 37.7749,
      lng: -122.4194,
      speed: 0,
      heading: 'N',
      sirenActive: false,
      lastServiceDate: '2026-07-15',
      nextServiceDate: '2026-12-30',
      lastLocation: 'Headquarters Secure Compound',
      notes: 'Integrated satellite uplink, 6 dispatch operator stations.'
    }
  ];

  // Seed Data: 10 Officers / Drivers
  const INITIAL_DRIVERS = [
    {
      id: 'DRV-01',
      badgeNumber: '4821',
      firstName: 'Marcus',
      lastName: 'Cole',
      rank: 'Sergeant',
      department: 'Patrol Division',
      phone: '(555) 019-4821',
      email: 'm.cole@metropolice.gov',
      status: 'On Duty',
      licenseClass: 'Class C Commercial',
      evocLevel: 'EVOC Master Instructor',
      certifications: ['Pursuit Certified', 'Tactical EVOC Level 3', 'PIT Maneuver', 'Firearms Master'],
      assignedVehicleId: 'VEH-101',
      assignedVehicleReg: 'POL-2041',
      yearsOfService: 12
    },
    {
      id: 'DRV-02',
      badgeNumber: '5910',
      firstName: 'Elena',
      lastName: 'Rostova',
      rank: 'Senior Officer',
      department: 'Highway Patrol',
      phone: '(555) 019-5910',
      email: 'e.rostova@metropolice.gov',
      status: 'On Duty',
      licenseClass: 'Class C CDL',
      evocLevel: 'EVOC High-Speed Specialist',
      certifications: ['High-Speed Intercept', 'PIT Maneuver', 'Spike Strip Deployment'],
      assignedVehicleId: 'VEH-102',
      assignedVehicleReg: 'INT-8832',
      yearsOfService: 7
    },
    {
      id: 'DRV-03',
      badgeNumber: '3301',
      firstName: 'David',
      lastName: 'Miller',
      rank: 'Lieutenant',
      department: 'SWAT / Special Ops',
      phone: '(555) 019-3301',
      email: 'd.miller@metropolice.gov',
      status: 'On Duty',
      licenseClass: 'Class B Heavy Endorsement',
      evocLevel: 'Tactical Armored Master',
      certifications: ['Armored Transport Endorsement', 'Breaching Driver', 'Hostage Rescue EVOC'],
      assignedVehicleId: 'VEH-103',
      assignedVehicleReg: 'SWAT-09',
      yearsOfService: 15
    },
    {
      id: 'DRV-04',
      badgeNumber: '6124',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      rank: 'K-9 Specialist',
      department: 'K-9 Tactical Unit',
      phone: '(555) 019-6124',
      email: 's.jenkins@metropolice.gov',
      status: 'On Duty',
      licenseClass: 'Class C',
      evocLevel: 'EVOC Level 2 Specialist',
      certifications: ['K-9 Handler Certified', 'Tactical Tracking', 'Emergency Response'],
      assignedVehicleId: 'VEH-104',
      assignedVehicleReg: 'K9-3011',
      yearsOfService: 6
    },
    {
      id: 'DRV-05',
      badgeNumber: '7021',
      firstName: 'Tyler',
      lastName: 'Vance',
      rank: 'Officer',
      department: 'Marine & Harbor Unit',
      phone: '(555) 019-7021',
      email: 't.vance@metropolice.gov',
      status: 'On Duty',
      licenseClass: 'Class A Commercial',
      evocLevel: 'Marine / Heavy Tow Specialist',
      certifications: ['Heavy Trailer Towing', 'Boat Launch Escort', 'Water Rescue Support'],
      assignedVehicleId: 'VEH-105',
      assignedVehicleReg: 'POL-1088',
      yearsOfService: 5
    },
    {
      id: 'DRV-06',
      badgeNumber: '4432',
      firstName: 'Carlos',
      lastName: 'Mendez',
      rank: 'Motor Officer',
      department: 'Traffic Bureau',
      phone: '(555) 019-4432',
      email: 'c.mendez@metropolice.gov',
      status: 'On Duty',
      licenseClass: 'Class M Motorcycle Certified',
      evocLevel: 'Police Motorcycle Master',
      certifications: ['Motorcade Escort', 'Tight Cone Course Instructor', 'Traffic Collision Reconstruction'],
      assignedVehicleId: 'VEH-106',
      assignedVehicleReg: 'TRAF-550',
      yearsOfService: 9
    },
    {
      id: 'DRV-07',
      badgeNumber: '2899',
      firstName: 'Rachel',
      lastName: 'Adams',
      rank: 'Detective',
      department: 'Criminal Investigation',
      phone: '(555) 019-2899',
      email: 'r.adams@metropolice.gov',
      status: 'On Duty',
      licenseClass: 'Class C',
      evocLevel: 'Covert / Unmarked EVOC',
      certifications: ['Surveillance Tactics', 'Dignitary Protection', 'Asset Protection'],
      assignedVehicleId: 'VEH-107',
      assignedVehicleReg: 'CID-7740',
      yearsOfService: 11
    },
    {
      id: 'DRV-08',
      badgeNumber: '8812',
      firstName: 'Liam',
      lastName: 'Chen',
      rank: 'Officer',
      department: 'Highway Patrol',
      phone: '(555) 019-8812',
      email: 'l.chen@metropolice.gov',
      status: 'On Duty',
      licenseClass: 'Class C',
      evocLevel: 'EVOC Level 2',
      certifications: ['Pursuit Certified', 'Traffic Safety Radar'],
      assignedVehicleId: 'VEH-109',
      assignedVehicleReg: 'INT-4410',
      yearsOfService: 4
    },
    {
      id: 'DRV-09',
      badgeNumber: '5104',
      firstName: 'James',
      lastName: "O'Connor",
      rank: 'Transport Officer',
      department: 'Detention Bureau',
      phone: '(555) 019-5104',
      email: 'j.oconnor@metropolice.gov',
      status: 'On Duty',
      licenseClass: 'Class B CDL Passenger',
      evocLevel: 'Heavy Transit Specialist',
      certifications: ['High-Risk Prisoner Transport', 'Evacuation Operations'],
      assignedVehicleId: 'VEH-110',
      assignedVehicleReg: 'VAN-202',
      yearsOfService: 8
    },
    {
      id: 'DRV-10',
      badgeNumber: '6641',
      firstName: 'Maya',
      lastName: 'Lin',
      rank: 'Officer',
      department: 'Patrol Division',
      phone: '(555) 019-6641',
      email: 'm.lin@metropolice.gov',
      status: 'On Duty',
      licenseClass: 'Class C',
      evocLevel: 'EVOC Level 2',
      certifications: ['Patrol Tactics', 'Field Training Officer'],
      assignedVehicleId: 'VEH-111',
      assignedVehicleReg: 'POL-3315',
      yearsOfService: 3
    }
  ];

  // Seed Data: 8 Dispatches / Trips
  const INITIAL_TRIPS = [
    {
      id: 'TRP-4091',
      vehicleId: 'VEH-102',
      vehicleReg: 'INT-8832',
      callSign: 'Interceptor-04',
      driverId: 'DRV-02',
      driverName: 'Officer Elena Rostova',
      origin: 'Central Headquarters',
      destination: 'Northern Highway Sector 4',
      departureDate: '2026-11-05',
      departureTime: '08:30',
      expectedArrival: '12:30',
      actualArrival: '',
      purpose: 'Highway Intercept Patrol & Radar Blitz',
      priority: 'Priority 2 - Routine Operational',
      status: 'Active',
      distanceKm: 42,
      notes: 'Active patrol on I-101. Monitoring high-speed commuter corridor.'
    },
    {
      id: 'TRP-4092',
      vehicleId: 'VEH-104',
      vehicleReg: 'K9-3011',
      callSign: 'K9-Unit-3',
      driverId: 'DRV-04',
      driverName: 'Officer Sarah Jenkins',
      origin: 'K-9 Training Compound',
      destination: 'Financial District Plaza',
      departureDate: '2026-11-05',
      departureTime: '09:00',
      expectedArrival: '14:00',
      actualArrival: '',
      purpose: 'Explosive Detection Sweep & Presence',
      priority: 'Priority 1 - High Visibility',
      status: 'Active',
      distanceKm: 18,
      notes: 'Routine sweep of transit hub and municipal hall.'
    },
    {
      id: 'TRP-4093',
      vehicleId: 'VEH-110',
      vehicleReg: 'VAN-202',
      callSign: 'Transport-02',
      driverId: 'DRV-09',
      driverName: "Officer James O'Connor",
      origin: 'Central Detention Cellblock',
      destination: 'County Superior Courthouse',
      departureDate: '2026-11-05',
      departureTime: '08:45',
      expectedArrival: '11:15',
      actualArrival: '',
      purpose: 'Detainee Arraignment Transport',
      priority: 'Priority 2 - Security Custody',
      status: 'Active',
      distanceKm: 15,
      notes: 'Transporting four defendants for preliminary hearing.'
    },
    {
      id: 'TRP-4088',
      vehicleId: 'VEH-101',
      vehicleReg: 'POL-2041',
      callSign: 'Alpha-01',
      driverId: 'DRV-01',
      driverName: 'Sgt. Marcus Cole',
      origin: 'Central Precinct',
      destination: 'Downtown Commercial Sector',
      departureDate: '2026-11-04',
      departureTime: '20:00',
      expectedArrival: '04:00',
      actualArrival: '04:05',
      purpose: 'Night Shift Perimeter Security Patrol',
      priority: 'Priority 2 - Routine',
      status: 'Completed',
      distanceKm: 85,
      notes: 'Shift completed with 4 field contacts and no vehicular incidents.'
    },
    {
      id: 'TRP-4089',
      vehicleId: 'VEH-103',
      vehicleReg: 'SWAT-09',
      callSign: 'Titan-01',
      driverId: 'DRV-03',
      driverName: 'Lt. David Miller',
      origin: 'Tactical Base',
      destination: 'Industrial Zone Warehouse 14',
      departureDate: '2026-11-04',
      departureTime: '14:00',
      expectedArrival: '17:30',
      actualArrival: '17:15',
      purpose: 'High-Risk Search Warrant Deployment',
      priority: 'Priority 1 - Emergency Tactical',
      status: 'Completed',
      distanceKm: 32,
      notes: 'Target secured without incident. Vehicle returned to station bay.'
    },
    {
      id: 'TRP-4090',
      vehicleId: 'VEH-107',
      vehicleReg: 'CID-7740',
      callSign: 'Echo-07',
      driverId: 'DRV-07',
      driverName: 'Det. Rachel Adams',
      origin: 'Criminal Investigation Bureau',
      destination: 'State Forensics Crime Lab',
      departureDate: '2026-11-04',
      departureTime: '11:00',
      expectedArrival: '15:00',
      actualArrival: '14:50',
      purpose: 'Chain of Custody Ballistics Transfer',
      priority: 'Priority 2 - Chain of Evidence',
      status: 'Completed',
      distanceKm: 48,
      notes: 'Delivered vault evidence boxes to State Lead Analyst.'
    },
    {
      id: 'TRP-4094',
      vehicleId: 'VEH-105',
      vehicleReg: 'POL-1088',
      callSign: 'Marine-02',
      driverId: 'DRV-05',
      driverName: 'Officer Tyler Vance',
      origin: 'Pier 39 Marine Operations',
      destination: 'South Bay Marina Launch',
      departureDate: '2026-11-06',
      departureTime: '07:00',
      expectedArrival: '16:00',
      actualArrival: '',
      purpose: 'Harbor Patrol & Regatta Safety Escort',
      priority: 'Priority 2 - Public Event',
      status: 'Scheduled',
      distanceKm: 26,
      notes: 'Tow patrol vessel 22-A to south marina for regatta safety.'
    },
    {
      id: 'TRP-4095',
      vehicleId: 'VEH-106',
      vehicleReg: 'TRAF-550',
      callSign: 'Motor-05',
      driverId: 'DRV-06',
      driverName: 'Officer Carlos Mendez',
      origin: 'Central Traffic Division',
      destination: 'Civic Auditorium Plaza',
      departureDate: '2026-11-06',
      departureTime: '13:00',
      expectedArrival: '18:00',
      actualArrival: '',
      purpose: 'Foreign Diplomatic Motorcade Lead Escort',
      priority: 'Priority 1 - VIP Security',
      status: 'Scheduled',
      distanceKm: 20,
      notes: 'Coordinate with State Department motorcade protection detail.'
    }
  ];

  // Seed Data: 8 Notifications
  const INITIAL_NOTIFICATIONS = [
    {
      id: 'NOTIF-101',
      title: 'Emergency Priority Dispatch',
      message: 'Highway Interceptor INT-8832 has activated pursuit sirens on Route 101 North.',
      type: 'alert',
      timestamp: '2026-11-05 09:18',
      isRead: false
    },
    {
      id: 'NOTIF-102',
      title: 'Trip Assignment Confirmed',
      message: 'Prisoner Van VAN-202 dispatched to County Superior Courthouse under Officer O\'Connor.',
      type: 'assignment',
      timestamp: '2026-11-05 08:45',
      isRead: false
    },
    {
      id: 'NOTIF-103',
      title: 'Scheduled Maintenance Due',
      message: 'Patrol Cruiser POL-9921 brake rotor and front suspension overhaul is underway in Bay 2.',
      type: 'maintenance',
      timestamp: '2026-11-05 08:00',
      isRead: false
    },
    {
      id: 'NOTIF-104',
      title: 'Trip Completed Successfully',
      message: 'Night Shift Patrol Alpha-01 (POL-2041) logged return to Central Precinct with 85 km driven.',
      type: 'completed',
      timestamp: '2026-11-05 04:05',
      isRead: true
    },
    {
      id: 'NOTIF-105',
      title: 'Low Fuel Warning',
      message: 'Vehicle K9-3011 fuel gauge reached 45%. Advise refueling before next assigned deployment.',
      type: 'update',
      timestamp: '2026-11-04 18:22',
      isRead: true
    },
    {
      id: 'NOTIF-106',
      title: 'Odometer Milestone',
      message: 'Dodge Charger INT-4410 crossed 28,000 miles. Routine tire rotation recommended.',
      type: 'maintenance',
      timestamp: '2026-11-04 16:10',
      isRead: true
    },
    {
      id: 'NOTIF-107',
      title: 'Driver Certification Renewed',
      message: 'Officer Carlos Mendez successfully recertified for Police Motorcycle Master EVOC.',
      type: 'update',
      timestamp: '2026-11-04 11:30',
      isRead: true
    },
    {
      id: 'NOTIF-108',
      title: 'Tactical Mission Concluded',
      message: 'BearCat SWAT-09 completed High-Risk Warrant Deployment at Industrial Zone Warehouse 14.',
      type: 'completed',
      timestamp: '2026-11-04 17:15',
      isRead: true
    }
  ];

  // Seed Data: 6 Maintenance Records
  const INITIAL_MAINTENANCE = [
    {
      id: 'MNT-301',
      vehicleId: 'VEH-108',
      vehicleReg: 'POL-9921',
      vehicleModel: 'Dodge Durango Pursuit',
      type: 'Brake System & Rotors',
      description: 'Severe pad wear detected. Front & rear ceramic pursuit rotors and calipers replaced.',
      cost: 450000,
      reportedDate: '2026-11-02',
      serviceDate: '2026-11-05',
      nextServiceDate: '2027-04-10',
      provider: 'Command Central Mechanical Workshop',
      status: 'In Progress',
      technician: 'Master Tech Ibrahim Usman'
    },
    {
      id: 'MNT-302',
      vehicleId: 'VEH-101',
      vehicleReg: 'POL-2041',
      vehicleModel: 'Ford Police Interceptor Utility',
      type: '15,000-km Scheduled Service',
      description: 'Synthetic engine oil change, oil filter, air filter, and multi-point tire pressure check.',
      cost: 180000,
      reportedDate: '2026-09-10',
      serviceDate: '2026-09-12',
      nextServiceDate: '2027-01-15',
      provider: 'Command Central Mechanical Workshop',
      status: 'Completed',
      technician: 'Sgt. Adebayo Ogun'
    },
    {
      id: 'MNT-303',
      vehicleId: 'VEH-103',
      vehicleReg: 'SWAT-09',
      vehicleModel: 'Lenco BearCat G3 Armored',
      type: 'Pneumatics & Ballistic Glass Check',
      description: 'Hydraulic turret motor inspection, run-flat tire seal inspection, and battery bank load test.',
      cost: 1250000,
      reportedDate: '2026-08-18',
      serviceDate: '2026-08-20',
      nextServiceDate: '2026-12-10',
      provider: 'Specialized Armor Support Services',
      status: 'Completed',
      technician: 'Inspector Emeka Okoye'
    },
    {
      id: 'MNT-304',
      vehicleId: 'VEH-104',
      vehicleReg: 'K9-3011',
      vehicleModel: 'Chevrolet Tahoe PPV',
      type: 'K-9 Air Conditioning & Siren Overhaul',
      description: 'Secondary kennel climate system compressor servicing and whelen siren speaker test.',
      cost: 320000,
      reportedDate: '2026-09-02',
      serviceDate: '2026-09-05',
      nextServiceDate: '2026-12-28',
      provider: 'Command Central Mechanical Workshop',
      status: 'Completed',
      technician: 'Cpl. Musa Bello'
    },
    {
      id: 'MNT-305',
      vehicleId: 'VEH-106',
      vehicleReg: 'TRAF-550',
      vehicleModel: 'BMW R1250RT-P',
      type: 'Drive Shaft & Clutch Inspection',
      description: 'Police package final drive oil flush, clutch cable tension adjustment, and blue beacon wiring.',
      cost: 240000,
      reportedDate: '2026-10-12',
      serviceDate: '2026-10-15',
      nextServiceDate: '2027-02-15',
      provider: 'Command Central Workshop — Motorbike Division',
      status: 'Completed',
      technician: 'Sgt. Chidi Nwosu'
    },
    {
      id: 'MNT-306',
      vehicleId: 'VEH-110',
      vehicleReg: 'VAN-202',
      vehicleModel: 'Ford Transit 350HD Prisoner Van',
      type: 'Transmission Flush & Security Partition',
      description: 'Automatic transmission fluid flush, rear cell latch electronic sensor recalibration.',
      cost: 520000,
      reportedDate: '2026-11-04',
      serviceDate: '2026-11-09',
      nextServiceDate: '2027-03-01',
      provider: 'Command Central Mechanical Workshop',
      status: 'Pending',
      technician: 'Inspector Kenneth Eze'
    }
  ];

  // Seed Data: 8 Fuel Logs
  const INITIAL_FUEL = [
    {
      id: 'FUL-501',
      vehicleId: 'VEH-101',
      vehicleReg: 'POL-2041',
      litres: 62,
      cost: 114.70,
      pricePerLitre: 1.85,
      date: '2026-11-04',
      mileage: 24080,
      station: 'Central Fleet Fuel Depot — Pump 3',
      fuelType: 'Premium Unleaded 93',
      officer: 'Sgt. Marcus Cole'
    },
    {
      id: 'FUL-502',
      vehicleId: 'VEH-102',
      vehicleReg: 'INT-8832',
      litres: 55,
      cost: 101.75,
      pricePerLitre: 1.85,
      date: '2026-11-04',
      mileage: 14720,
      station: 'Highway Station 4 Depot — Pump 1',
      fuelType: 'Premium Unleaded 93',
      officer: 'Officer Elena Rostova'
    },
    {
      id: 'FUL-503',
      vehicleId: 'VEH-103',
      vehicleReg: 'SWAT-09',
      litres: 110,
      cost: 214.50,
      pricePerLitre: 1.95,
      date: '2026-11-03',
      mileage: 8320,
      station: 'Tactical Base Emergency Storage',
      fuelType: 'Ultra-Low Sulfur Diesel',
      officer: 'Lt. David Miller'
    },
    {
      id: 'FUL-504',
      vehicleId: 'VEH-104',
      vehicleReg: 'K9-3011',
      litres: 68,
      cost: 125.80,
      pricePerLitre: 1.85,
      date: '2026-11-03',
      mileage: 31320,
      station: 'Central Fleet Fuel Depot — Pump 2',
      fuelType: 'Regular Unleaded 89',
      officer: 'Officer Sarah Jenkins'
    },
    {
      id: 'FUL-505',
      vehicleId: 'VEH-105',
      vehicleReg: 'POL-1088',
      litres: 75,
      cost: 138.75,
      pricePerLitre: 1.85,
      date: '2026-11-02',
      mileage: 19180,
      station: 'Harbor Marine Fuel Float',
      fuelType: 'Regular Unleaded 89',
      officer: 'Officer Tyler Vance'
    },
    {
      id: 'FUL-506',
      vehicleId: 'VEH-106',
      vehicleReg: 'TRAF-550',
      litres: 19,
      cost: 37.05,
      pricePerLitre: 1.95,
      date: '2026-11-02',
      mileage: 6380,
      station: 'Central Fleet Fuel Depot — Pump 4',
      fuelType: 'Premium Unleaded 93',
      officer: 'Officer Carlos Mendez'
    },
    {
      id: 'FUL-507',
      vehicleId: 'VEH-107',
      vehicleReg: 'CID-7740',
      litres: 38,
      cost: 70.30,
      pricePerLitre: 1.85,
      date: '2026-11-01',
      mileage: 42020,
      station: 'Civic Center Municipal Fuel Pump',
      fuelType: 'Regular Unleaded 89',
      officer: 'Det. Rachel Adams'
    },
    {
      id: 'FUL-508',
      vehicleId: 'VEH-110',
      vehicleReg: 'VAN-202',
      litres: 80,
      cost: 156.00,
      pricePerLitre: 1.95,
      date: '2026-11-01',
      mileage: 53080,
      station: 'County Detention Depot',
      fuelType: 'Ultra-Low Sulfur Diesel',
      officer: "Officer James O'Connor"
    }
  ];

  // Seed Data: Settings
  const INITIAL_SETTINGS = {
    commanderName: 'CP Imo State Command',
    commanderBadge: 'NPF-IMO-001',
    commanderEmail: 'imo.commander@police.gov.ng',
    department: 'Nigeria Police Force — Imo State Command',
    terminalId: 'NPF-IMO-HQ-TERM-01',
    theme: 'light',
    speedUnit: 'KMH',
    telemetryRefreshRate: 5, // seconds
    audioAlerts: true,
    autoAssignTracking: true,
    lastBackup: '2026-11-05 09:00'
  };

  // Helper to load or initialize
  function loadFromStorage(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage read error for ' + key, e);
    }
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }

  function saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('fleet_data_updated', { detail: { key, value } }));
    } catch (e) {
      console.error('LocalStorage write error for ' + key, e);
    }
  }

  // --- LARAVEL BACKEND MYSQL SYNC HELPERS ---
  function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
  }

  function apiFetch(url, options) {
    options = options || {};
    options.headers = Object.assign({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-TOKEN': getCsrfToken()
    }, options.headers || {});
    return fetch(url, options).catch(function(err) {
      console.warn('Backend API request warn:', err);
    });
  }

  function normalizeVehicle(v) {
    return {
      id: v.id,
      registration: v.registration,
      callSign: v.call_sign || v.callSign || '',
      vin: v.vin || '',
      make: v.make,
      model: v.model,
      year: v.year,
      type: v.type,
      department: v.department,
      assignedDriverId: v.assigned_driver_id || v.assignedDriverId || '',
      assignedDriverName: v.assigned_driver_name || v.assignedDriverName || 'Unassigned',
      status: v.status,
      mileage: Number(v.mileage || 0),
      fuelLevel: Number(v.fuel_level !== undefined ? v.fuel_level : v.fuelLevel || 100),
      fuelCapacity: Number(v.fuel_capacity || v.fuelCapacity || 75),
      batteryLevel: Number(v.battery_level !== undefined ? v.battery_level : v.batteryLevel || 100),
      lat: Number(v.lat || 37.7749),
      lng: Number(v.lng || -122.4194),
      speed: Number(v.speed || 0),
      heading: v.heading || 'N',
      sirenActive: Boolean(v.siren_active !== undefined ? v.siren_active : v.sirenActive),
      lastServiceDate: v.last_service_date || v.lastServiceDate || '',
      nextServiceDate: v.next_service_date || v.nextServiceDate || '',
      lastLocation: v.last_location || v.lastLocation || '',
      notes: v.notes || ''
    };
  }

  function toBackendVehicle(v) {
    return {
      id: v.id,
      registration: v.registration,
      call_sign: v.callSign || v.call_sign,
      vin: v.vin,
      make: v.make,
      model: v.model,
      year: v.year,
      type: v.type,
      department: v.department,
      assigned_driver_id: v.assignedDriverId || v.assigned_driver_id,
      assigned_driver_name: v.assignedDriverName || v.assigned_driver_name,
      status: v.status,
      mileage: v.mileage,
      fuel_level: v.fuelLevel !== undefined ? v.fuelLevel : v.fuel_level,
      fuel_capacity: v.fuelCapacity || v.fuel_capacity,
      battery_level: v.batteryLevel !== undefined ? v.batteryLevel : v.battery_level,
      lat: v.lat,
      lng: v.lng,
      speed: v.speed,
      heading: v.heading,
      siren_active: v.sirenActive !== undefined ? v.sirenActive : v.siren_active,
      last_service_date: v.lastServiceDate || v.last_service_date,
      next_service_date: v.nextServiceDate || v.next_service_date,
      last_location: v.lastLocation || v.last_location,
      notes: v.notes
    };
  }

  function normalizeDriver(d) {
    return {
      id: d.id,
      badgeNumber: d.badge_number || d.badgeNumber,
      firstName: d.first_name || d.firstName,
      lastName: d.last_name || d.lastName,
      rank: d.rank,
      department: d.department,
      phone: d.phone,
      email: d.email,
      status: d.status,
      licenseClass: d.license_class || d.licenseClass,
      evocLevel: d.evoc_level || d.evocLevel,
      certifications: Array.isArray(d.certifications) ? d.certifications : (typeof d.certifications === 'string' ? JSON.parse(d.certifications || '[]') : []),
      assignedVehicleId: d.assigned_vehicle_id || d.assignedVehicleId,
      assignedVehicleReg: d.assigned_vehicle_reg || d.assignedVehicleReg,
      yearsOfService: Number(d.years_of_service || d.yearsOfService || 0)
    };
  }

  function toBackendDriver(d) {
    return {
      id: d.id,
      badge_number: d.badgeNumber || d.badge_number,
      first_name: d.firstName || d.first_name,
      last_name: d.lastName || d.last_name,
      rank: d.rank,
      department: d.department,
      phone: d.phone,
      email: d.email,
      status: d.status,
      license_class: d.licenseClass || d.license_class,
      evoc_level: d.evocLevel || d.evoc_level,
      certifications: d.certifications,
      assigned_vehicle_id: d.assignedVehicleId || d.assigned_vehicle_id,
      assigned_vehicle_reg: d.assignedVehicleReg || d.assigned_vehicle_reg,
      years_of_service: d.yearsOfService || d.years_of_service
    };
  }

  function normalizeTrip(t) {
    return {
      id: t.id,
      vehicleId: t.vehicle_id || t.vehicleId,
      vehicleReg: t.vehicle_reg || t.vehicleReg,
      callSign: t.call_sign || t.callSign,
      driverId: t.driver_id || t.driverId,
      driverName: t.driver_name || t.driverName,
      origin: t.origin,
      destination: t.destination,
      departureDate: t.departure_date || t.departureDate,
      departureTime: t.departure_time || t.departureTime,
      expectedArrival: t.expected_arrival || t.expectedArrival || '',
      actualArrival: t.actual_arrival || t.actualArrival || '',
      purpose: t.purpose,
      priority: t.priority,
      status: t.status,
      distanceKm: Number(t.distance_km || t.distanceKm || 0),
      notes: t.notes || ''
    };
  }

  function toBackendTrip(t) {
    return {
      id: t.id,
      vehicle_id: t.vehicleId || t.vehicle_id,
      vehicle_reg: t.vehicleReg || t.vehicle_reg,
      call_sign: t.callSign || t.call_sign,
      driver_id: t.driverId || t.driver_id,
      driver_name: t.driverName || t.driver_name,
      origin: t.origin,
      destination: t.destination,
      departure_date: t.departureDate || t.departure_date,
      departure_time: t.departureTime || t.departure_time,
      expected_arrival: t.expectedArrival || t.expected_arrival,
      actual_arrival: t.actualArrival || t.actual_arrival,
      purpose: t.purpose,
      priority: t.priority,
      status: t.status,
      distance_km: t.distanceKm || t.distance_km,
      notes: t.notes
    };
  }

  function normalizeMaintenance(m) {
    return {
      id: m.id,
      vehicleId: m.vehicle_id || m.vehicleId,
      vehicleReg: m.vehicle_reg || m.vehicleReg,
      vehicleModel: m.vehicle_model || m.vehicleModel,
      type: m.type,
      description: m.description,
      cost: Number(m.cost || 0),
      reportedDate: m.reported_date || m.reportedDate,
      serviceDate: m.service_date || m.serviceDate || '',
      nextServiceDate: m.next_service_date || m.nextServiceDate || '',
      provider: m.provider,
      status: m.status,
      technician: m.technician
    };
  }

  function toBackendMaintenance(m) {
    return {
      id: m.id,
      vehicle_id: m.vehicleId || m.vehicle_id,
      vehicle_reg: m.vehicleReg || m.vehicle_reg,
      vehicle_model: m.vehicleModel || m.vehicle_model,
      type: m.type,
      description: m.description,
      cost: m.cost,
      reported_date: m.reportedDate || m.reported_date,
      service_date: m.serviceDate || m.service_date,
      next_service_date: m.nextServiceDate || m.next_service_date,
      provider: m.provider,
      status: m.status,
      technician: m.technician
    };
  }

  function normalizeFuel(f) {
    return {
      id: f.id,
      vehicleId: f.vehicle_id || f.vehicleId,
      vehicleReg: f.vehicle_reg || f.vehicleReg,
      litres: Number(f.litres || 0),
      cost: Number(f.cost || 0),
      pricePerLitre: Number(f.price_per_litre || f.pricePerLitre || 0),
      date: f.date,
      mileage: Number(f.mileage || 0),
      station: f.station,
      fuelType: f.fuel_type || f.fuelType,
      officer: f.officer
    };
  }

  function toBackendFuel(f) {
    return {
      id: f.id,
      vehicle_id: f.vehicleId || f.vehicle_id,
      vehicle_reg: f.vehicleReg || f.vehicle_reg,
      litres: f.litres,
      cost: f.cost,
      price_per_litre: f.pricePerLitre || f.price_per_litre,
      date: f.date,
      mileage: f.mileage,
      station: f.station,
      fuel_type: f.fuelType || f.fuel_type,
      officer: f.officer
    };
  }

  function normalizeNotification(n) {
    return {
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      timestamp: n.timestamp,
      isRead: Boolean(n.is_read !== undefined ? n.is_read : n.isRead)
    };
  }

  function normalizeSettings(s) {
    if (!s) return INITIAL_SETTINGS;
    return {
      commanderName: s.commander_name || s.commanderName || 'CP Imo State Command',
      commanderBadge: s.commander_badge || s.commanderBadge || 'NPF-IMO-001',
      commanderEmail: s.commander_email || s.commanderEmail || 'imo.commander@police.gov.ng',
      department: s.department || 'Nigeria Police Force — Imo State Command',
      terminalId: s.terminal_id || s.terminalId || 'NPF-IMO-HQ-TERM-01',
      theme: s.theme || 'light',
      speedUnit: s.speed_unit || s.speedUnit || 'KMH',
      telemetryRefreshRate: Number(s.telemetry_refresh_rate || s.telemetryRefreshRate || 5),
      audioAlerts: Boolean(s.audio_alerts !== undefined ? s.audio_alerts : s.audioAlerts),
      autoAssignTracking: Boolean(s.auto_assign_tracking !== undefined ? s.auto_assign_tracking : s.autoAssignTracking),
      lastBackup: s.last_backup || s.lastBackup || ''
    };
  }

  // Public Storage API
  const FleetStorage = {
    KEYS: STORAGE_KEYS,

    // Initialize all stores and sync from MySQL
    init: function () {
      loadFromStorage(STORAGE_KEYS.VEHICLES, []);
      loadFromStorage(STORAGE_KEYS.DRIVERS, []);
      loadFromStorage(STORAGE_KEYS.TRIPS, []);
      loadFromStorage(STORAGE_KEYS.MAINTENANCE, []);
      loadFromStorage(STORAGE_KEYS.FUEL, []);
      loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
      loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);

      this.syncFromBackend();
    },

    syncFromBackend: function () {
      fetch('/api/fleet/all', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'same-origin'
      })
        .then(function (res) {
          if (!res.ok) {
            throw new Error('Fleet sync failed with HTTP ' + res.status);
          }

          return res.json();
        })
        .then(function (data) {
          var collections = [
            'vehicles',
            'drivers',
            'trips',
            'maintenance',
            'fuel',
            'notifications'
          ];

          if (
            !data ||
            !collections.every(function (key) {
              return Array.isArray(data[key]);
            })
          ) {
            throw new Error('Invalid fleet synchronization response.');
          }

          var vehicles = data.vehicles.map(normalizeVehicle);
          var drivers = data.drivers.map(normalizeDriver);
          var trips = data.trips.map(normalizeTrip);
          var maintenance = data.maintenance.map(normalizeMaintenance);
          var fuel = data.fuel.map(normalizeFuel);
          var notifications = data.notifications.map(normalizeNotification);
          var settings = normalizeSettings(data.settings);

          localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
          localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
          localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
          localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(maintenance));
          localStorage.setItem(STORAGE_KEYS.FUEL, JSON.stringify(fuel));
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

          window.dispatchEvent(
            new CustomEvent('fleet_data_updated', {
              detail: { sync: true }
            })
          );
        })
        .catch(function (err) {
          console.warn('Backend sync deferred:', err);
        });
    },

    // Vehicle Methods
    getVehicles: function () {
      const vehicles = loadFromStorage(STORAGE_KEYS.VEHICLES, []);
      return Array.isArray(vehicles) ? vehicles : [];
    },
    getVehicleById: function (id) {
      const vehicles = this.getVehicles();
      return vehicles.find(v => v.id === id || v.registration === id);
    },
    saveVehicles: function (list) {
      saveToStorage(STORAGE_KEYS.VEHICLES, list);
    },
    addVehicle: function (vehicle) {
      const list = this.getVehicles();
      if (!vehicle.id) {
        vehicle.id = 'VEH-' + (Math.floor(Math.random() * 900) + 100);
      }
      list.unshift(vehicle);
      this.saveVehicles(list);
      this.addNotification({
        title: 'New Vehicle Commissioned',
        message: `Vehicle ${vehicle.registration} (${vehicle.make} ${vehicle.model}) was registered into ${vehicle.department}.`,
        type: 'assignment'
      });
      apiFetch('/api/fleet/vehicles', {
        method: 'POST',
        body: JSON.stringify(toBackendVehicle(vehicle))
      });
      return vehicle;
    },
    updateVehicle: function (id, updatedFields) {
      const list = this.getVehicles();
      const index = list.findIndex(v => v.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updatedFields };
        this.saveVehicles(list);
        apiFetch('/api/fleet/vehicles/' + encodeURIComponent(id), {
          method: 'PUT',
          body: JSON.stringify(toBackendVehicle(list[index]))
        });
        return list[index];
      }
      return null;
    },
    deleteVehicle: function (id) {
      let list = this.getVehicles();
      const item = list.find(v => v.id === id);
      list = list.filter(v => v.id !== id);
      this.saveVehicles(list);
      if (item) {
        this.addNotification({
          title: 'Vehicle Decommissioned',
          message: `Vehicle ${item.registration} was removed from the active police fleet database.`,
          type: 'alert'
        });
      }
      apiFetch('/api/fleet/vehicles/' + encodeURIComponent(id), {
        method: 'DELETE'
      });
      return true;
    },

    // Driver Methods
    getDrivers: function () {
      return loadFromStorage(STORAGE_KEYS.DRIVERS, []);
    },
    getDriverById: function (id) {
      const drivers = this.getDrivers();
      return drivers.find(d => d.id === id || d.badgeNumber === id);
    },
    saveDrivers: function (list) {
      saveToStorage(STORAGE_KEYS.DRIVERS, list);
    },
    addDriver: function (driver) {
      const list = this.getDrivers();
      if (!driver.id) {
        driver.id = 'DRV-' + (Math.floor(Math.random() * 90) + 10);
      }
      list.unshift(driver);
      this.saveDrivers(list);
      this.addNotification({
        title: 'Officer Roster Updated',
        message: `${driver.rank} ${driver.firstName} ${driver.lastName} (Badge #${driver.badgeNumber}) added to roster.`,
        type: 'update'
      });
      apiFetch('/api/fleet/drivers', {
        method: 'POST',
        body: JSON.stringify(toBackendDriver(driver))
      });
      return driver;
    },
    updateDriver: function (id, updatedFields) {
      const list = this.getDrivers();
      const index = list.findIndex(d => d.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updatedFields };
        this.saveDrivers(list);
        apiFetch('/api/fleet/drivers/' + encodeURIComponent(id), {
          method: 'PUT',
          body: JSON.stringify(toBackendDriver(list[index]))
        });
        return list[index];
      }
      return null;
    },
    deleteDriver: function (id) {
      let list = this.getDrivers();
      list = list.filter(d => d.id !== id);
      this.saveDrivers(list);
      apiFetch('/api/fleet/drivers/' + encodeURIComponent(id), {
        method: 'DELETE'
      });
      return true;
    },

    // Trip / Dispatch Methods
    getTrips: function () {
      return loadFromStorage(STORAGE_KEYS.TRIPS, []);
    },
    saveTrips: function (list) {
      saveToStorage(STORAGE_KEYS.TRIPS, list);
    },
    addTrip: function (trip) {
      const list = this.getTrips();
      if (!trip.id) {
        trip.id = 'TRP-' + (Math.floor(Math.random() * 9000) + 1000);
      }
      list.unshift(trip);
      this.saveTrips(list);

      // Automatically update vehicle status to 'On Trip'
      if (trip.vehicleId) {
        this.updateVehicle(trip.vehicleId, {
          status: 'On Trip',
          assignedDriverId: trip.driverId || '',
          assignedDriverName: trip.driverName || ''
        });
      }

      // Automatically notify
      this.addNotification({
        title: 'New Dispatch Assigned',
        message: `Trip ${trip.id} assigned to ${trip.driverName} on vehicle ${trip.vehicleReg}. Destination: ${trip.destination}`,
        type: 'assignment'
      });

      apiFetch('/api/fleet/trips', {
        method: 'POST',
        body: JSON.stringify(toBackendTrip(trip))
      });

      return trip;
    },
    updateTrip: function (id, updatedFields) {
      const list = this.getTrips();
      const index = list.findIndex(t => t.id === id);
      if (index !== -1) {
        const oldTrip = list[index];
        list[index] = { ...oldTrip, ...updatedFields };
        this.saveTrips(list);

        // If trip was marked completed, set vehicle back to available
        if (updatedFields.status === 'Completed' && oldTrip.status !== 'Completed') {
          if (oldTrip.vehicleId) {
            this.updateVehicle(oldTrip.vehicleId, {
              status: 'Available',
              speed: 0,
              sirenActive: false
            });
          }
          this.addNotification({
            title: 'Trip Completed',
            message: `Trip ${id} completed by ${oldTrip.driverName} on ${oldTrip.vehicleReg}.`,
            type: 'completed'
          });
        }

        apiFetch('/api/fleet/trips/' + encodeURIComponent(id), {
          method: 'PUT',
          body: JSON.stringify(toBackendTrip(list[index]))
        });

        return list[index];
      }
      return null;
    },
    deleteTrip: function (id) {
      let list = this.getTrips();
      list = list.filter(t => t.id !== id);
      this.saveTrips(list);
      apiFetch('/api/fleet/trips/' + encodeURIComponent(id), {
        method: 'DELETE'
      });
      return true;
    },

    // Maintenance Methods
    getMaintenance: function () {
      return loadFromStorage(STORAGE_KEYS.MAINTENANCE, []);
    },
    saveMaintenance: function (list) {
      saveToStorage(STORAGE_KEYS.MAINTENANCE, list);
    },
    addMaintenance: function (item) {
      const list = this.getMaintenance();
      if (!item.id) {
        item.id = 'MNT-' + (Math.floor(Math.random() * 900) + 100);
      }
      list.unshift(item);
      this.saveMaintenance(list);

      // If scheduled or in-progress, set vehicle to Maintenance
      if (item.status === 'In Progress' && item.vehicleId) {
        this.updateVehicle(item.vehicleId, { status: 'Maintenance' });
      }

      this.addNotification({
        title: 'Service Booked',
        message: `Maintenance scheduled for vehicle ${item.vehicleReg}: ${item.type}`,
        type: 'maintenance'
      });

      apiFetch('/api/fleet/maintenance', {
        method: 'POST',
        body: JSON.stringify(toBackendMaintenance(item))
      });

      return item;
    },
    updateMaintenance: function (id, updatedFields) {
      const list = this.getMaintenance();
      const index = list.findIndex(m => m.id === id);
      if (index !== -1) {
        const old = list[index];
        list[index] = { ...old, ...updatedFields };
        this.saveMaintenance(list);

        if (updatedFields.status === 'Completed' && old.vehicleId) {
          this.updateVehicle(old.vehicleId, { status: 'Available' });
          this.addNotification({
            title: 'Maintenance Completed',
            message: `Service for ${old.vehicleReg} (${old.type}) completed. Vehicle returned to Available status.`,
            type: 'completed'
          });
        }

        apiFetch('/api/fleet/maintenance/' + encodeURIComponent(id), {
          method: 'PUT',
          body: JSON.stringify(toBackendMaintenance(list[index]))
        });

        return list[index];
      }
      return null;
    },
    deleteMaintenance: function (id) {
      let list = this.getMaintenance();
      list = list.filter(m => m.id !== id);
      this.saveMaintenance(list);
      apiFetch('/api/fleet/maintenance/' + encodeURIComponent(id), {
        method: 'DELETE'
      });
      return true;
    },

    // Fuel Methods
    getFuel: function () {
      return loadFromStorage(STORAGE_KEYS.FUEL, []);
    },
    saveFuel: function (list) {
      saveToStorage(STORAGE_KEYS.FUEL, list);
    },
    addFuel: function (entry) {
      const list = this.getFuel();
      if (!entry.id) {
        entry.id = 'FUL-' + (Math.floor(Math.random() * 900) + 100);
      }
      list.unshift(entry);
      this.saveFuel(list);

      // Update vehicle fuel level to 100%
      if (entry.vehicleId) {
        this.updateVehicle(entry.vehicleId, {
          fuelLevel: 98,
          mileage: entry.mileage ? Number(entry.mileage) : undefined
        });
      }

      apiFetch('/api/fleet/fuel', {
        method: 'POST',
        body: JSON.stringify(toBackendFuel(entry))
      });

      return entry;
    },
    deleteFuel: function (id) {
      let list = this.getFuel();
      list = list.filter(f => f.id !== id);
      this.saveFuel(list);
      apiFetch('/api/fleet/fuel/' + encodeURIComponent(id), {
        method: 'DELETE'
      });
      return true;
    },

    // Notifications Methods
    getNotifications: function () {
      return loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    },
    saveNotifications: function (list) {
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    },
    addNotification: function (n) {
      const list = this.getNotifications();
      const newNotif = {
        id: 'NOTIF-' + (Math.floor(Math.random() * 9000) + 1000),
        title: n.title,
        message: n.message,
        type: n.type || 'update',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false
      };
      list.unshift(newNotif);
      this.saveNotifications(list);
      apiFetch('/api/fleet/notifications', {
        method: 'POST',
        body: JSON.stringify(newNotif)
      });
      return newNotif;
    },
    markNotificationRead: function (id) {
      const list = this.getNotifications();
      const item = list.find(n => n.id === id);
      if (item) {
        item.isRead = true;
        this.saveNotifications(list);
        apiFetch('/api/fleet/notifications/' + encodeURIComponent(id) + '/read', {
          method: 'POST'
        });
      }
    },
    markAllNotificationsRead: function () {
      const list = this.getNotifications();
      list.forEach(n => { n.isRead = true; });
      this.saveNotifications(list);
      apiFetch('/api/fleet/notifications/read-all', {
        method: 'POST'
      });
    },
    deleteNotification: function (id) {
      let list = this.getNotifications();
      list = list.filter(n => n.id !== id);
      this.saveNotifications(list);
      apiFetch('/api/fleet/notifications/' + encodeURIComponent(id), {
        method: 'DELETE'
      });
    },
    clearAllNotifications: function () {
      this.saveNotifications([]);
      apiFetch('/api/fleet/notifications/read-all', { method: 'POST' });
    },

    // Settings Methods
    getSettings: function () {
      return loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    },
    saveSettings: function (settings) {
      saveToStorage(STORAGE_KEYS.SETTINGS, settings);
      apiFetch('/api/fleet/settings', {
        method: 'POST',
        body: JSON.stringify({
          commander_name: settings.commanderName,
          commander_badge: settings.commanderBadge,
          commander_email: settings.commanderEmail,
          department: settings.department,
          terminal_id: settings.terminalId,
          theme: settings.theme,
          speed_unit: settings.speedUnit,
          telemetry_refresh_rate: settings.telemetryRefreshRate,
          audio_alerts: settings.audioAlerts,
          auto_assign_tracking: settings.autoAssignTracking
        })
      });
    },

    // Server-side Authentication
    logout: function () {
      const logoutForm = document.getElementById('logout-form');

      if (logoutForm) {
        logoutForm.submit();
      } else {
        window.location.href = '/login';
      }
    }
  };

  // Initialize storage immediately on script load
  FleetStorage.init();

  // Expose to window
  window.FleetStorage = FleetStorage;

})(window);
