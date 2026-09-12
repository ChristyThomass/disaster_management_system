import { AlertItem, DisasterReport, InventoryItem, HelpRequest, Volunteer, ReliefLocation } from '../types';

export const INITIAL_KERALA_RELIEF_LOCATIONS: ReliefLocation[] = [
  {
    id: 'kl-101',
    name: 'Chooralmala Primary Relief Camp',
    district: 'Wayanad',
    type: 'Relief Camp',
    lat: 11.5518,
    lng: 76.1302,
    capacity: 650,
    occupancy: 580,
    status: 'Near Capacity',
    contactPerson: 'Collectorate Control Room (Wayanad)',
    phone: '+91 4936 204151',
    address: 'Govt Higher Secondary School, Meppadi, Chooralmala',
    suppliesNeeded: ['Blankets', 'Infant Formula', 'Clean Drinking Water', 'Dry Rations'],
    amenities: ['24/7 Medical Team', 'Clean Drinking Water', 'Sanitation Blocks', 'Child Care Area'],
    lastUpdated: '10 mins ago'
  },
  {
    id: 'kl-102',
    name: 'Kalpetta SKMJ School Emergency Shelter',
    district: 'Wayanad',
    type: 'Emergency Shelter',
    lat: 11.6094,
    lng: 76.0827,
    capacity: 800,
    occupancy: 420,
    status: 'Operational',
    contactPerson: 'K. V. Suresh (Tahsil Officer)',
    phone: '+91 9447 123456',
    address: 'SKMJ High School Grounds, Kalpetta Town',
    suppliesNeeded: ['Bed Sheets', 'Hygiene Kits', 'Torch Lights'],
    amenities: ['Food Counter', 'Medical Triage', 'Charging Stations', 'Sanitation'],
    lastUpdated: '25 mins ago'
  },
  {
    id: 'kl-103',
    name: 'Meppadi High-Risk Landslide Warning Zone',
    district: 'Wayanad',
    type: 'Flood High-Risk Zone',
    lat: 11.5450,
    lng: 76.1210,
    capacity: 0,
    occupancy: 0,
    status: 'Alert / Hazard',
    contactPerson: 'NDRF Control Officer',
    phone: '1077 (Toll Free)',
    address: 'Vellarimala Slopes & Chaliyar River Corridor',
    suppliesNeeded: ['Immediate Evacuation', 'Search Boats', 'Earth Movers'],
    amenities: ['NDRF Rescue Base', 'Helicopter Landing Pad'],
    lastUpdated: '5 mins ago'
  },
  {
    id: 'kl-104',
    name: 'Aluva Town Hall Flood Relief Camp',
    district: 'Ernakulam',
    type: 'Relief Camp',
    lat: 10.1076,
    lng: 76.3516,
    capacity: 1200,
    occupancy: 940,
    status: 'Near Capacity',
    contactPerson: 'Revenue Divisional Officer Aluva',
    phone: '+91 484 2623322',
    address: 'Aluva Town Hall & Municipal Complex, Periyar River Bank',
    suppliesNeeded: ['Water Purification Tablets', 'Mosquito Nets', 'First Aid Refills'],
    amenities: ['Community Kitchen', 'Doctors on Duty', 'Power Backup Generator'],
    lastUpdated: '15 mins ago'
  },
  {
    id: 'kl-105',
    name: 'Kadavanthra Central Supply Distribution Hub',
    district: 'Ernakulam',
    type: 'Supply Hub',
    lat: 9.9634,
    lng: 76.2978,
    capacity: 5000,
    occupancy: 3100,
    status: 'Operational',
    contactPerson: 'District Supply Officer Ernakulam',
    phone: '+91 484 2422200',
    address: 'KSRTC Bus Terminal Storage Facility, Ernakulam South',
    suppliesNeeded: ['Volunteers for Packing', 'Heavy Transport Trucks'],
    amenities: ['Cold Storage', 'Forklift Crew', 'Dispatch Bay'],
    lastUpdated: '1 hr ago'
  },
  {
    id: 'kl-106',
    name: 'Chalakudy River Bank Hazard Zone',
    district: 'Thrissur',
    type: 'Flood High-Risk Zone',
    lat: 10.3070,
    lng: 76.3353,
    capacity: 0,
    occupancy: 0,
    status: 'Alert / Hazard',
    contactPerson: 'Thrissur District Collectorate',
    phone: '+91 487 2362200',
    address: 'Lower Chalakudy Basin & Peringalkuthu Spillway Sector',
    suppliesNeeded: ['Evacuation Patrol Boats', 'Public Address Trucks'],
    amenities: ['Emergency Siren Alert System'],
    lastUpdated: '30 mins ago'
  },
  {
    id: 'kl-107',
    name: 'Govt Model HSS Chalakudy Relief Center',
    district: 'Thrissur',
    type: 'Relief Camp',
    lat: 10.3120,
    lng: 76.3410,
    capacity: 500,
    occupancy: 490,
    status: 'Near Capacity',
    contactPerson: 'Camp Superintendent Thomas P.',
    phone: '+91 9895 443322',
    address: 'Govt Model Higher Secondary School, Chalakudy Main Road',
    suppliesNeeded: ['Medicines for Elderly', 'Detergent & Soaps', 'Rice & Pulses'],
    amenities: ['Separate Women Wing', 'Doctor Clinic', 'Sanitation'],
    lastUpdated: '40 mins ago'
  },
  {
    id: 'kl-108',
    name: 'Kuttanad Waterway Emergency Shelter',
    district: 'Alappuzha',
    type: 'Emergency Shelter',
    lat: 9.4981,
    lng: 76.4014,
    capacity: 900,
    occupancy: 900,
    status: 'Full',
    contactPerson: 'Alappuzha Disaster Management Cell',
    phone: '+91 477 2238630',
    address: 'St. George Higher Secondary School, Champakulam, Kuttanad',
    suppliesNeeded: ['Water Ambulances', 'Submersible Pumps', 'Disinfectants'],
    amenities: ['Boat Jetty Access', 'Solar Emergency Lights', 'Medical Room'],
    lastUpdated: '12 mins ago'
  },
  {
    id: 'kl-109',
    name: 'SD College Camp & Medical Command Base',
    district: 'Alappuzha',
    type: 'Medical Post',
    lat: 9.4900,
    lng: 76.3388,
    capacity: 1500,
    occupancy: 1100,
    status: 'Operational',
    contactPerson: 'Dr. Radhakrishnan (DMO)',
    phone: '+91 477 2251214',
    address: 'Sanatana Dharma College Campus, Santhanapuram, Alappuzha',
    suppliesNeeded: ['IV Fluids', 'Bandages', 'ORSS Packets', 'Snake Antivenom'],
    amenities: ['ICU Mobile Unit', 'Ambulance Fleet', 'Psychological Counseling'],
    lastUpdated: '8 mins ago'
  },
  {
    id: 'kl-110',
    name: 'Munnar Govt High School Relief Camp',
    district: 'Idukki',
    type: 'Relief Camp',
    lat: 10.0889,
    lng: 77.0595,
    capacity: 400,
    occupancy: 280,
    status: 'Operational',
    contactPerson: 'Devikulam Revenue Officer',
    phone: '+91 4865 230225',
    address: 'Old Munnar Colony Grounds, Idukki District',
    suppliesNeeded: ['Heavy Jackets', 'Thermal Blankets', 'Kerosene Generators'],
    amenities: ['Warm Fireplace Rooms', 'Hot Meals', 'Emergency Radio Base'],
    lastUpdated: '1 hr ago'
  },
  {
    id: 'kl-111',
    name: 'Kattappana Emergency Response Post',
    district: 'Idukki',
    type: 'Medical Post',
    lat: 9.7781,
    lng: 77.1190,
    capacity: 350,
    occupancy: 180,
    status: 'Operational',
    contactPerson: 'Idukki Rescue Control',
    phone: '+91 4868 272201',
    address: 'Kattappana Municipal Auditorium, High Range Highway',
    suppliesNeeded: ['First Aid Supply Bags', 'Trauma Kits'],
    amenities: ['4x4 Rescue Vehicles', 'Helipad Access', 'Triage Station'],
    lastUpdated: '2 hrs ago'
  },
  {
    id: 'kl-112',
    name: 'Vadakara Govt Girls High School Relief Camp',
    district: 'Kozhikode',
    type: 'Relief Camp',
    lat: 11.6083,
    lng: 75.5917,
    capacity: 600,
    occupancy: 310,
    status: 'Operational',
    contactPerson: 'Vadakara Municipal Secretary',
    phone: '+91 496 2522020',
    address: 'Court Road, Vadakara Town, Kozhikode',
    suppliesNeeded: ['Sanitary Napkins', 'Children Clothes', 'Dry Snacks'],
    amenities: ['Play Area for Children', 'Public Kitchen', 'First Aid Station'],
    lastUpdated: '50 mins ago'
  },
  {
    id: 'kl-113',
    name: 'Trivandrum Central Stadium Emergency Hub',
    district: 'Thiruvananthapuram',
    type: 'Supply Hub',
    lat: 8.4901,
    lng: 76.9526,
    capacity: 8000,
    occupancy: 4200,
    status: 'Operational',
    contactPerson: 'State Disaster Management Authority (SDMA)',
    phone: '+91 471 2331345',
    address: 'Central Stadium Grounds, Palayam, Thiruvananthapuram',
    suppliesNeeded: ['Truck Logistics Drivers', 'Volunteers'],
    amenities: ['State Command Control Center', 'Helipad', 'Media Communications Unit'],
    lastUpdated: '5 mins ago'
  },
  {
    id: 'kl-114',
    name: 'Nilambur Govt Relief & Rescue Center',
    district: 'Malappuram',
    type: 'Relief Camp',
    lat: 11.2770,
    lng: 76.2250,
    capacity: 700,
    occupancy: 610,
    status: 'Near Capacity',
    contactPerson: 'Nilambur Tahsildar Office',
    phone: '+91 4931 220234',
    address: 'Govt Manavedan HSS Grounds, Nilambur',
    suppliesNeeded: ['Life Jackets', 'Inflatable Boats', 'Flashlights'],
    amenities: ['Fire Force Base Station', 'Community Dining', 'Doctors Camp'],
    lastUpdated: '20 mins ago'
  },
  {
    id: 'kl-115',
    name: 'Ranni St. Thomas HSS Relief Camp',
    district: 'Pathanamthitta',
    type: 'Relief Camp',
    lat: 9.3808,
    lng: 76.7844,
    capacity: 550,
    occupancy: 410,
    status: 'Operational',
    contactPerson: 'Pathanamthitta Control Room',
    phone: '+91 468 2222515',
    address: 'Pampa River Basin, Ranni, Pathanamthitta',
    suppliesNeeded: ['Water Pumps', 'Chlorine Granules', 'Baby Food'],
    amenities: ['24/7 Power', 'Purified Water Well', 'Medical Checkup'],
    lastUpdated: '35 mins ago'
  }
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'kl-alt-001',
    title: '[Emergency Alert] Flash Flood & Landslide Code Red Alert for Wayanad & Idukki',
    severity: 'code-red',
    region: 'Wayanad & Idukki',
    state: 'Kerala',
    agency: 'KSDMA / IMD Thiruvananthapuram',
    timeAgo: '10 mins ago',
    description: 'Disaster Warning: Torrential rainfall exceeding 204mm predicted across Chooralmala, Meppadi, and Munnar hill slopes. High vulnerability to landslides and flash floods. Move to district relief shelters immediately.',
    category: 'Landslide',
    recommendedActions: [
      'Avoid traveling through hill passes after sunset',
      'Move away from Vellarimala riverbanks',
      'Follow NDRF & Collectorate Control Room directives'
    ],
    sourceUrl: 'https://sdma.kerala.gov.in/'
  },
  {
    id: 'kl-alt-002',
    title: '[Emergency Alert] Central Water Commission Flood Warning: Chalakudy & Periyar Rivers',
    severity: 'warning',
    region: 'Ernakulam & Thrissur',
    state: 'Kerala',
    agency: 'Central Water Commission (CWC) / KSDMA',
    timeAgo: '25 mins ago',
    description: 'CWC hydrological monitoring stations in Chalakudy and Aluva report water levels approaching the Warning Mark due to heavy catchments inflow. Inhabitants near river banks are advised to stay vigilant.',
    category: 'Dam Release & Flood',
    recommendedActions: [
      'Relocate livestock and valuables to elevated ground',
      'Do not cross submerged bridges or causeways',
      'Monitor KSDMA local public broadcast alerts'
    ],
    sourceUrl: 'https://sdma.kerala.gov.in/'
  },
  {
    id: 'kl-alt-003',
    title: '[Emergency Alert] INCOIS Coastal Swell Surge Warning (Kallakkadal Phenomenon)',
    severity: 'warning',
    region: 'Alappuzha, Kollam & Thiruvananthapuram Coasts',
    state: 'Kerala',
    agency: 'INCOIS / Coastal Disaster Control',
    timeAgo: '45 mins ago',
    description: 'High sea swell waves ranging from 2.8m to 3.4m forecasted along Kerala coastline from Kasaragod to Vizhinjam. Fishermen are strictly advised not to venture into the sea.',
    category: 'Coastal / High Waves',
    recommendedActions: [
      'Total ban on coastal fishing operations',
      'Avoid recreational activities on beaches',
      'Secure boats at harbor anchor points'
    ],
    sourceUrl: 'https://sdma.kerala.gov.in/'
  },
  {
    id: 'kl-alt-004',
    title: '[Emergency Alert] Severe Thunderstorm & High Wind Advisory for Interior Kerala',
    severity: 'warning',
    region: 'Palakkad, Malappuram & Kozhikode',
    state: 'Kerala',
    agency: 'State Control Room / KSDMA',
    timeAgo: '1 hr ago',
    description: 'Convective cloud developments over Western Ghats causing localized wind squalls up to 50 km/h and intense lightning. Power outages and tree falls reported in Vadakara and Nilambur.',
    category: 'Thunderstorm',
    recommendedActions: [
      'Unplug sensitive electronic appliances',
      'Avoid sheltering under tall trees or tin sheds',
      'Stay indoors until thunderstorm clears'
    ],
    sourceUrl: 'https://sdma.kerala.gov.in/'
  },
  {
    id: 'kl-alt-005',
    title: '[Emergency Alert] Controlled Reservoir Spill Discharge: Banasurasagar & Pamba Dams',
    severity: 'info',
    region: 'Wayanad & Pathanamthitta',
    state: 'Kerala',
    agency: 'KSEB / Dam Safety Authority',
    timeAgo: '2 hrs ago',
    description: 'Spillway shutters raised by 10 cm at Banasurasagar and Kakki-Anathode dams. Water level in downstream Kabini and Pampa rivers will rise gradually. Precautionary alert issued for riverfront residents.',
    category: 'Dam Release & Flood',
    recommendedActions: [
      'Avoid bathing, fishing, or washing in river channels',
      'Listen to siren warnings near dam spillways'
    ],
    sourceUrl: 'https://sdma.kerala.gov.in/'
  },
  {
    id: 'kl-alt-006',
    title: '[Emergency Alert] Heavy Rain & Landslide Warning for Kuttanad & High Range Routes',
    severity: 'warning',
    region: 'Alappuzha & Kottayam (Kuttanad Waterways)',
    state: 'Kerala',
    agency: 'KSDMA / IMD Kerala',
    timeAgo: '3 hrs ago',
    description: 'Waterlogging reported in low-lying paddy fields of Kuttanad and Champakulam. Boat transportation services operating under emergency speed limits.',
    category: 'Dam Release & Flood',
    recommendedActions: [
      'Use water ambulances for medical emergencies',
      'Store emergency drinking water and medicines'
    ],
    sourceUrl: 'https://sdma.kerala.gov.in/'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-101',
    name: 'First Aid Kit - Type A',
    category: 'Medical',
    quantity: 1250,
    unit: 'units',
    location: 'Central Warehouse',
    status: 'In Stock',
    iconName: 'medical_services',
    iconColorClass: 'text-tertiary'
  },
  {
    id: 'inv-102',
    name: 'Purified Water (5L)',
    category: 'Food & Water',
    quantity: 45,
    unit: 'units',
    location: 'Sector South Depot',
    status: 'Low Stock',
    iconName: 'water_drop',
    iconColorClass: 'text-warning'
  },
  {
    id: 'inv-103',
    name: 'Transport Truck (Heavy)',
    category: 'Vehicle',
    quantity: 0,
    unit: 'units',
    location: 'Sector North Depot',
    status: 'Out of Stock',
    iconName: 'local_shipping',
    iconColorClass: 'text-on-surface-variant'
  },
  {
    id: 'inv-104',
    name: 'Emergency Tents (10-Person)',
    category: 'Shelter',
    quantity: 320,
    unit: 'units',
    location: 'Central Warehouse',
    status: 'In Stock',
    iconName: 'holiday_village',
    iconColorClass: 'text-tertiary'
  },
  {
    id: 'inv-105',
    name: 'Portable Generators (10kW)',
    category: 'Tools & Power',
    quantity: 18,
    unit: 'units',
    location: 'Sector East Depot',
    status: 'Low Stock',
    iconName: 'bolt',
    iconColorClass: 'text-warning'
  },
  {
    id: 'inv-106',
    name: 'High-Capacity Dewatering Pumps',
    category: 'Tools & Power',
    quantity: 85,
    unit: 'units',
    location: 'Sector West Depot',
    status: 'In Stock',
    iconName: 'water_ph',
    iconColorClass: 'text-tertiary'
  },
  {
    id: 'inv-107',
    name: 'Emergency MRE Rations (Pack of 24)',
    category: 'Food & Water',
    quantity: 3400,
    unit: 'packs',
    location: 'Central Warehouse',
    status: 'In Stock',
    iconName: 'restaurant',
    iconColorClass: 'text-tertiary'
  },
  {
    id: 'inv-108',
    name: 'Trauma & Surgical Field Kits',
    category: 'Medical',
    quantity: 120,
    unit: 'kits',
    location: 'Sector South Depot',
    status: 'Low Stock',
    iconName: 'health_and_safety',
    iconColorClass: 'text-warning'
  }
];

export const INITIAL_DISASTER_REPORTS: DisasterReport[] = [
  {
    id: 'rep-001',
    type: 'Flash Flood',
    severity: 'Critical',
    status: 'Critical',
    location: 'Riverside District (Periyar Basin)',
    timeLogged: '10 mins ago',
    date: '2026-09-01',
    time: '12:30',
    description: 'Rapidly rising water levels trapped 12 households in low-lying residential sector. Water height exceeding 4 feet.',
    reporterName: 'John Doe (Civilian)',
    contact: '+1 555-0192',
    hasVisualEvidence: true,
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    assignedUnit: 'Rescue Team Bravo-4',
    iconName: 'flood'
  },
  {
    id: 'rep-002',
    type: 'Wildfire',
    severity: 'High',
    status: 'Investigating',
    location: 'Northern Ridge Forest Range',
    timeLogged: '45 mins ago',
    date: '2026-09-01',
    time: '11:55',
    description: 'Brush fire ignited near power grid line, spreading southward with wind gusts up to 35 mph.',
    reporterName: 'Forestry Ranger Station 2',
    contact: '+1 555-0842',
    hasVisualEvidence: true,
    imageUrl: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?auto=format&fit=crop&w=800&q=80',
    assignedUnit: 'Fire Recon Alpha',
    iconName: 'forest'
  },
  {
    id: 'rep-003',
    type: 'Structural Collapse',
    severity: 'Critical',
    status: 'En Route',
    location: 'Downtown Commercial Sector',
    timeLogged: '2 hrs ago',
    date: '2026-09-01',
    time: '10:40',
    description: 'Partial commercial complex collapse on 5th avenue. Search and rescue team requested for potential trapped occupants.',
    reporterName: 'City Dispatch Center',
    contact: '+1 555-9110',
    hasVisualEvidence: true,
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    assignedUnit: 'USAR Heavy Rescue 1',
    iconName: 'house'
  },
  {
    id: 'rep-004',
    type: 'Landslide & Mudflow',
    severity: 'High',
    status: 'Investigating',
    location: 'Chooralmala Hill Pass (Wayanad)',
    timeLogged: '3 hrs ago',
    date: '2026-09-01',
    time: '09:15',
    description: 'Severe debris flow and mudslide blocking mountain highway. Heavy earth-movers and rescue gear dispatched.',
    reporterName: 'State Highway Patrol',
    contact: '+1 555-4811',
    hasVisualEvidence: true,
    imageUrl: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=800&q=80',
    assignedUnit: 'DOT Clearance Crew 3',
    iconName: 'terrain'
  },
  {
    id: 'rep-005',
    type: 'Bridge Submergence & River Overflow',
    severity: 'Critical',
    status: 'Critical',
    location: 'Aluva Periyar Riverfront Corridor',
    timeLogged: '4 hrs ago',
    date: '2026-09-01',
    time: '08:30',
    description: 'Periyar river embankment breached near municipal bridge. Road access cut off, inflatable rescue dinghies deployed.',
    reporterName: 'Kerala Fire & Rescue Force',
    contact: '+91 484 2623322',
    hasVisualEvidence: true,
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
    assignedUnit: 'NDRF Battalion 4',
    iconName: 'flood'
  }
];

export const INITIAL_HELP_REQUESTS: HelpRequest[] = [
  {
    id: 'hr-1',
    requesterName: 'Sarah Jenkins',
    category: 'Medical Assistance',
    location: '142 Maplewood Drive, Riverside',
    urgentNeed: 'Insulin refrigeration lost due to power outage & minor injury treatment.',
    status: 'Pending',
    peopleCount: 3,
    timeAgo: '18 mins ago'
  },
  {
    id: 'hr-2',
    requesterName: 'St. Mary Community Shelter',
    category: 'Food & Clean Water',
    location: '88 Chapel Street, Sector South',
    urgentNeed: 'Requires 200 gallons of drinking water and warm meals for evacuees.',
    status: 'Assigned',
    peopleCount: 85,
    timeAgo: '40 mins ago'
  },
  {
    id: 'hr-3',
    requesterName: 'Carlos Rivera',
    category: 'Evacuation & Transport',
    location: 'Westside Senior Living Unit 4B',
    urgentNeed: 'Wheelchair user needs emergency transport to high-ground shelter.',
    status: 'Pending',
    peopleCount: 1,
    timeAgo: '1 hr ago'
  }
];

export const INITIAL_VOLUNTEERS: Volunteer[] = [
  {
    id: 'vol-1',
    name: 'Dr. Aris Thorne',
    role: 'Medical First Responder',
    location: 'Riverside Sector',
    status: 'Active Field',
    skills: ['Emergency Triage', 'Surgical Prep', 'HAM Radio'],
    contact: '+91 98470 12345',
    email: 'aris.thorne@keralarescue.org'
  },
  {
    id: 'vol-2',
    name: 'Elena Rostova',
    role: 'Logistics Coordinator',
    location: 'Central Warehouse',
    status: 'Active Field',
    skills: ['Forklift Certified', 'Inventory Management', 'Bilingual'],
    contact: '+91 98470 54321',
    email: 'elena.rostova@keralarescue.org'
  },
  {
    id: 'vol-3',
    name: 'Marcus Vance',
    role: 'Water Rescue Specialist',
    location: 'District 4 Station',
    status: 'On Call',
    skills: ['Swiftwater Rescue', 'Boat Operator', 'CPR Instructor'],
    contact: '+91 98470 67890',
    email: 'marcus.vance@keralarescue.org'
  },
  {
    id: 'vol-4',
    name: 'Priya Sharma',
    role: 'Crisis Communications',
    location: 'Admin Command',
    status: 'Active Field',
    skills: ['GIS Mapping', 'Public Broadcasting', 'Data Entry'],
    contact: '+91 98470 11223',
    email: 'priya.sharma@keralarescue.org'
  }
];

export const MONTHLY_TRENDS_DATA = [
  { month: 'Jan', incidents: 12 },
  { month: 'Feb', incidents: 19 },
  { month: 'Mar', incidents: 15 },
  { month: 'Apr', incidents: 25 },
  { month: 'May', incidents: 22 },
  { month: 'Jun', incidents: 30 }
];

export const RESOURCE_DISTRIBUTION_DATA = [
  { name: 'Food Rations', value: 40, color: '#4c56af' },
  { name: 'Water', value: 25, color: '#005f7b' },
  { name: 'Medical', value: 15, color: '#af101a' },
  { name: 'Shelter Tents', value: 20, color: '#8f6f6c' }
];
