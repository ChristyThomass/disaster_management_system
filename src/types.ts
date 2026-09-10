export const KERALA_DISTRICTS = [
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod',
];

export type NavigationTab = 
  | 'home'
  | 'active-alerts'
  | 'kerala-map'
  | 'report-disaster'
  | 'volunteer'
  | 'admin-dashboard'
  | 'admin-disaster-reports'
  | 'admin-inventory'
  | 'admin-kerala-map'
  | 'admin-help-requests'
  | 'admin-volunteers'
  | 'admin-alerts'
  | 'admin-analytics'
  | 'admin-settings';

export interface ReliefLocation {
  id: string;
  name: string;
  district: string;
  type: 'Relief Camp' | 'Emergency Shelter' | 'Medical Post' | 'Flood High-Risk Zone' | 'Supply Hub';
  lat: number;
  lng: number;
  capacity: number;
  occupancy: number;
  status: 'Operational' | 'Near Capacity' | 'Full' | 'Alert / Hazard';
  contactPerson: string;
  phone: string;
  address: string;
  suppliesNeeded: string[];
  amenities: string[];
  lastUpdated: string;
}

export interface AlertItem {
  id: string;
  title: string;
  severity: 'code-red' | 'warning' | 'info';
  region: string;
  state?: string;
  agency?: string;
  timeAgo: string;
  description?: string;
  category?: 'Heavy Rainfall' | 'Landslide' | 'Dam Release & Flood' | 'Coastal / High Waves' | 'Thunderstorm' | string;
  recommendedActions?: string[];
  sourceUrl?: string;
}

export interface YoloBoundingBox {
  id: string;
  label: string;
  category: 'structural' | 'water' | 'fire' | 'human' | 'electrical' | 'obstruction';
  confidence: number; // 0 to 1
  box: {
    x: number;      // percentage (0-100)
    y: number;      // percentage (0-100)
    width: number;  // percentage (0-100)
    height: number; // percentage (0-100)
  };
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
}

export interface YoloDetectionResult {
  reportId?: string;
  imageUrl: string;
  analyzedAt: string;
  model: string;
  overallConfidence: number; // 0 to 100
  damageSeverity: 'None (Safe)' | 'Minor' | 'Moderate' | 'Severe' | 'Catastrophic';
  isSafeScene?: boolean;
  hazardScore: number; // 0 to 100
  trappedCasualtyRisk: 'None Detected' | 'Possible Entrapment' | 'High Life Risk';
  detectedObjectsCount: number;
  detections: YoloBoundingBox[];
  summary: string;
  recommendedActions: string[];
  aiCertifiedReportText: string;
}

export interface DisasterReport {
  id: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Investigating' | 'En Route' | 'Critical' | 'Resolved' | 'Dispatching';
  location: string;
  timeLogged: string;
  date: string;
  time: string;
  description: string;
  reporterName?: string;
  contact?: string;
  reporterId?: string;
  reporterRole?: string;
  reporterEmail?: string;
  hasVisualEvidence?: boolean;
  imageUrl?: string;
  videoUrl?: string;
  assignedUnit?: string;
  iconName: string;
  aiVerified?: boolean;
  aiConfidence?: number;
  aiDamageSeverity?: 'None (Safe)' | 'Minor' | 'Moderate' | 'Severe' | 'Catastrophic';
  aiIsSafeScene?: boolean;
  aiVerificationTimestamp?: string;
  aiDetectedHazards?: string[];
  aiGeneratedReport?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Medical' | 'Food & Water' | 'Vehicle' | 'Shelter' | 'Tools & Power';
  quantity: number;
  unit: string;
  location: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  iconName: string;
  iconColorClass: string;
}

export interface HelpRequest {
  id: string;
  requesterName: string;
  category: string;
  location: string;
  urgentNeed: string;
  status: 'Pending' | 'Assigned' | 'Fulfilled';
  peopleCount: number;
  timeAgo: string;
}

export interface Volunteer {
  id: string;
  name: string;
  role: string;
  location: string;
  status: 'Active Field' | 'On Call' | 'In Training';
  skills: string[];
  contact: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'Civilian' | 'Volunteer' | 'Relief Personnel' | 'Administrator';
  district?: string;
  phone?: string;
  createdAt?: string;
}

export interface SosAlert {
  id?: string;
  user_id?: string;
  full_name?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  message?: string;
  status?: string;
  created_at?: string;
}

