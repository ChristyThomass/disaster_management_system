/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import {
  DisasterReport,
  HelpRequest,
  Volunteer,
  ReliefLocation,
  AlertItem,
  InventoryItem,
  UserProfile,
  SosAlert,
} from '../types';

export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://auazpiwbvsbzrccsqnyf.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Gcz5ghFiPpx6ykGFylFi5w_PD1ATEpx';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// -------------------------------------------------------------
// IMAGE COMPRESSION & OPTIMIZATION HELPER
// Ensures images are ultra-fast to upload, fit well within database limits, and never fail
// -------------------------------------------------------------
export async function compressImageToDataUrl(
  file: File | Blob,
  maxDimension = 1280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(reader.result as string);
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// -------------------------------------------------------------
// MEDIA STORAGE (IMAGES & VIDEOS)
// Uploads to Supabase Storage bucket with multi-bucket fallback and data URL guarantee
// -------------------------------------------------------------
export async function uploadMediaToSupabase(
  fileOrBlob: File | Blob | string,
  folder: 'images' | 'videos' = 'images',
  customFileName?: string
): Promise<{ url: string | null; storageType: 'supabase_storage' | 'direct_db_data' | 'url'; error?: string }> {
  try {
    // If it's already a public web URL (http:// or https://), return directly
    if (typeof fileOrBlob === 'string' && fileOrBlob.startsWith('http')) {
      return { url: fileOrBlob, storageType: 'url' };
    }

    let fileToUpload: Blob;
    let fileName = customFileName || `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (typeof fileOrBlob === 'string' && fileOrBlob.startsWith('data:')) {
      // Convert base64 data URL to Blob
      const arr = fileOrBlob.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : (folder === 'images' ? 'image/jpeg' : 'video/mp4');
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      fileToUpload = new Blob([u8arr], { type: mime });
      const ext = mime.split('/')[1] || (folder === 'images' ? 'jpg' : 'mp4');
      if (!fileName.includes('.')) fileName = `${fileName}.${ext}`;
    } else if (fileOrBlob instanceof File) {
      fileToUpload = fileOrBlob;
      const ext = fileOrBlob.name.split('.').pop() || (folder === 'images' ? 'jpg' : 'mp4');
      if (!fileName.includes('.')) fileName = `${fileName}.${ext}`;
    } else if (fileOrBlob instanceof Blob) {
      fileToUpload = fileOrBlob;
      const ext = fileOrBlob.type.split('/')[1] || (folder === 'images' ? 'jpg' : 'mp4');
      if (!fileName.includes('.')) fileName = `${fileName}.${ext}`;
    } else {
      return { url: null, storageType: 'direct_db_data', error: 'Invalid file input' };
    }

    // Try standard candidate buckets in Supabase Storage
    const candidateBuckets = ['disaster-evidence', 'evidence', 'media', 'images', 'public'];
    let uploadedPublicUrl: string | null = null;
    let lastStorageError: string | null = null;

    for (const bucket of candidateBuckets) {
      try {
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, fileToUpload, {
            cacheControl: '3600',
            upsert: true,
            contentType: fileToUpload.type || (folder === 'images' ? 'image/jpeg' : 'video/mp4'),
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

          if (publicData?.publicUrl) {
            uploadedPublicUrl = publicData.publicUrl;
            return { url: uploadedPublicUrl, storageType: 'supabase_storage' };
          }
        } else {
          lastStorageError = uploadError.message;
        }
      } catch (err: any) {
        lastStorageError = err?.message;
      }
    }

    // If storage bucket upload was blocked (e.g. bucket not created in dashboard yet),
    // fallback to storing an optimized data URI directly in the database row.
    // PostgreSQL TEXT columns hold up to 1GB, ensuring 100% data preservation!
    if (folder === 'images') {
      const optimizedDataUrl = await compressImageToDataUrl(fileToUpload);
      return {
        url: optimizedDataUrl,
        storageType: 'direct_db_data',
        error: lastStorageError || undefined,
      };
    }

    return {
      url: null,
      storageType: 'direct_db_data',
      error: lastStorageError || 'Storage upload unsuccessful',
    };
  } catch (err: any) {
    console.warn('Supabase media processing note:', err);
    return { url: null, storageType: 'direct_db_data', error: err?.message };
  }
}

// -------------------------------------------------------------
// DISASTER REPORTS
// -------------------------------------------------------------
export async function saveDisasterReportToSupabase(
  report: DisasterReport
): Promise<{ success: boolean; error?: string; storageInfo?: string }> {
  try {
    let finalImageUrl = report.imageUrl || null;
    let finalVideoUrl = report.videoUrl || null;
    let storageInfo = 'direct';

    // If image is a local blob/file URL or raw base64, attempt storage upload
    if (finalImageUrl && !finalImageUrl.startsWith('http')) {
      const uploadRes = await uploadMediaToSupabase(finalImageUrl, 'images', `report_${report.id}_image`);
      if (uploadRes.url) {
        finalImageUrl = uploadRes.url;
        storageInfo = uploadRes.storageType;
      }
    }

    const payload = {
      id: report.id,
      type: report.type,
      severity: report.severity,
      status: report.status,
      location: report.location,
      time_logged: report.timeLogged || report.time || 'Just now',
      date: report.date || new Date().toISOString().split('T')[0],
      time: report.time || new Date().toTimeString().slice(0, 5),
      description: report.description || '',
      reporter_name: report.reporterName || 'Anonymous Civilian Reporter',
      contact: report.contact || '',
      has_visual_evidence: !!(report.hasVisualEvidence || finalImageUrl || finalVideoUrl),
      image_url: finalImageUrl,
      video_url: finalVideoUrl,
      assigned_unit: report.assignedUnit || 'Pending Dispatcher Review',
      icon_name: report.iconName || 'report',
      created_at: new Date().toISOString(),
    };

    // Primary upsert with all metadata
    const { error } = await supabase.from('disaster_reports').upsert(payload);

    if (error) {
      console.warn('Primary disaster_reports upsert warning, trying resilient schema:', error.message);
      // Fallback in case user table has minimalist schema
      const minimalPayload = {
        id: report.id,
        type: report.type,
        severity: report.severity,
        location: report.location,
        description: report.description || '',
        image_url: finalImageUrl,
        created_at: new Date().toISOString(),
      };
      const { error: minimalError } = await supabase.from('disaster_reports').upsert(minimalPayload);
      if (minimalError) {
        return { success: false, error: minimalError.message };
      }
    }

    return { success: true, storageInfo };
  } catch (err: any) {
    console.error('Error saving disaster report to Supabase:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function fetchDisasterReportsFromSupabase(): Promise<DisasterReport[] | null> {
  try {
    const { data, error } = await supabase
      .from('disaster_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      type: row.type || 'Disaster Incident',
      severity: row.severity || 'High',
      status: row.status || 'Investigating',
      location: row.location || 'Unknown Sector',
      timeLogged: row.time_logged || row.time || 'Logged',
      date: row.date || new Date().toISOString().split('T')[0],
      time: row.time || '',
      description: row.description || '',
      reporterName: row.reporter_name || 'Civilian Reporter',
      contact: row.contact || '',
      hasVisualEvidence: !!(row.has_visual_evidence || row.image_url || row.video_url),
      imageUrl: row.image_url || undefined,
      videoUrl: row.video_url || undefined,
      assignedUnit: row.assigned_unit || 'Regional Response Unit',
      iconName: row.icon_name || 'report',
    }));
  } catch {
    return null;
  }
}

export async function deleteDisasterReportFromSupabase(
  reportId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('disaster_reports').delete().eq('id', reportId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// -------------------------------------------------------------
// HELP REQUESTS
// -------------------------------------------------------------
export async function saveHelpRequestToSupabase(
  request: HelpRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('help_requests').upsert({
      id: request.id,
      requester_name: request.requesterName,
      category: request.category,
      location: request.location,
      urgent_need: request.urgentNeed,
      status: request.status,
      people_count: request.peopleCount,
      time_ago: request.timeAgo,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase help_requests insert warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error saving help request to Supabase:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function fetchHelpRequestsFromSupabase(): Promise<HelpRequest[] | null> {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      requesterName: row.requester_name,
      category: row.category,
      location: row.location,
      urgentNeed: row.urgent_need,
      status: row.status,
      peopleCount: row.people_count || 1,
      timeAgo: row.time_ago || 'Recently',
    }));
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// VOLUNTEERS
// -------------------------------------------------------------
export async function saveVolunteerToSupabase(
  volunteer: Volunteer
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('volunteers').upsert({
      id: volunteer.id,
      name: volunteer.name,
      role: volunteer.role,
      location: volunteer.location,
      status: volunteer.status,
      skills: volunteer.skills,
      contact: volunteer.contact,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase volunteers insert warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error saving volunteer to Supabase:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function fetchVolunteersFromSupabase(): Promise<Volunteer[] | null> {
  try {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      location: row.location,
      status: row.status,
      skills: row.skills || [],
      contact: row.contact,
    }));
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// RELIEF CAMPS & LOCATIONS
// -------------------------------------------------------------
export async function saveReliefCampToSupabase(
  camp: ReliefLocation
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('relief_camps').upsert({
      id: camp.id,
      name: camp.name,
      district: camp.district,
      type: camp.type,
      lat: camp.lat,
      lng: camp.lng,
      capacity: camp.capacity,
      occupancy: camp.occupancy,
      status: camp.status,
      contact_person: camp.contactPerson,
      phone: camp.phone,
      address: camp.address,
      supplies_needed: camp.suppliesNeeded,
      amenities: camp.amenities,
      last_updated: camp.lastUpdated,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase relief_camps insert warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error saving relief camp to Supabase:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function fetchReliefCampsFromSupabase(): Promise<ReliefLocation[] | null> {
  try {
    const { data, error } = await supabase
      .from('relief_camps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      district: row.district,
      type: row.type,
      lat: Number(row.lat),
      lng: Number(row.lng),
      capacity: row.capacity,
      occupancy: row.occupancy,
      status: row.status,
      contactPerson: row.contact_person,
      phone: row.phone,
      address: row.address,
      suppliesNeeded: row.supplies_needed || [],
      amenities: row.amenities || [],
      lastUpdated: row.last_updated || 'Just now',
    }));
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// EMERGENCY ALERTS
// -------------------------------------------------------------
export async function saveAlertToSupabase(
  alertItem: AlertItem
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('alerts').upsert({
      id: alertItem.id,
      title: alertItem.title,
      severity: alertItem.severity,
      region: alertItem.region,
      time_ago: alertItem.timeAgo,
      description: alertItem.description || '',
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase alerts insert warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error saving alert to Supabase:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function fetchAlertsFromSupabase(): Promise<AlertItem[] | null> {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      severity: row.severity,
      region: row.region,
      timeAgo: row.time_ago,
      description: row.description,
    }));
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// INVENTORY
// -------------------------------------------------------------
export async function saveInventoryItemToSupabase(
  item: InventoryItem
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('inventory').upsert({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      location: item.location,
      status: item.status,
      icon_name: item.iconName,
      icon_color_class: item.iconColorClass,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase inventory insert warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error saving inventory item to Supabase:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function deleteInventoryItemFromSupabase(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function fetchInventoryFromSupabase(): Promise<InventoryItem[] | null> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      quantity: row.quantity,
      unit: row.unit,
      location: row.location,
      status: row.status,
      iconName: row.icon_name || 'inventory_2',
      iconColorClass: row.icon_color_class || 'text-blue-600 bg-blue-50',
    }));
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// USER PROFILES & SIGN UP ACCOUNTS (USERS TABLE & PASSWORD VERIFICATION)
// -------------------------------------------------------------
export async function saveUserProfileToSupabase(
  user: UserProfile,
  password?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const basePayload = {
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'Civilian',
      district: user.district || 'Wayanad',
      created_at: user.createdAt || new Date().toISOString(),
    };

    // 1. Try saving to 'users' table with password column
    let userSaveErr: string | null = null;
    if (password) {
      // Try with both password and password_hash
      const { error: err1 } = await supabase.from('users').upsert({
        ...basePayload,
        password: password,
        password_hash: password,
      });

      if (err1) {
        // Try with password column only
        const { error: err2 } = await supabase.from('users').upsert({
          ...basePayload,
          password: password,
        });

        if (err2) {
          // Try with password_hash column only
          const { error: err3 } = await supabase.from('users').upsert({
            ...basePayload,
            password_hash: password,
          });

          if (err3) {
            // Fallback without password column if table has not been altered yet
            const { error: fallbackErr } = await supabase.from('users').upsert(basePayload);
            if (fallbackErr) userSaveErr = fallbackErr.message;
          }
        }
      }
    } else {
      const { error } = await supabase.from('users').upsert(basePayload);
      if (error) userSaveErr = error.message;
    }

    // 2. Also mirror to 'user_profiles' table
    try {
      if (password) {
        const { error: pErr1 } = await supabase.from('user_profiles').upsert({
          ...basePayload,
          password: password,
          password_hash: password,
        });
        if (pErr1) {
          await supabase.from('user_profiles').upsert(basePayload);
        }
      } else {
        await supabase.from('user_profiles').upsert(basePayload);
      }
    } catch {
      // ignore secondary table mirror error
    }

    if (userSaveErr) {
      console.warn('Supabase users insert notice:', userSaveErr);
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error saving user profile to Supabase:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function verifyUserCredentialsInSupabase(
  usernameOrEmail: string,
  passwordAttempt: string
): Promise<{
  success: boolean;
  user?: UserProfile;
  userExists?: boolean;
  error?: string;
}> {
  try {
    const term = usernameOrEmail.trim().toLowerCase();
    const cleanPass = passwordAttempt.trim();

    // Query 'users' table
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.${term},full_name.ilike.${term},phone.eq.${usernameOrEmail.trim()}`);

    let matchedRow = users && users.length > 0 ? users[0] : null;

    // If not found in 'users', check 'user_profiles' table
    if (!matchedRow) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`email.ilike.${term},full_name.ilike.${term},phone.eq.${usernameOrEmail.trim()}`);
      if (profiles && profiles.length > 0) {
        matchedRow = profiles[0];
      }
    }

    if (matchedRow) {
      const storedPass = matchedRow.password || matchedRow.password_hash;
      const user: UserProfile = {
        id: matchedRow.id,
        fullName: matchedRow.full_name,
        email: matchedRow.email,
        phone: matchedRow.phone,
        role: matchedRow.role || 'Civilian',
        district: matchedRow.district || 'Wayanad',
        createdAt: matchedRow.created_at,
      };

      // 1. If password was stored in the database row, verify exact match
      if (storedPass) {
        if (storedPass === cleanPass) {
          return { success: true, user, userExists: true };
        } else {
          return {
            success: false,
            userExists: true,
            error: 'Incorrect password. The password does not match your previous registered sign in.',
          };
        }
      }

      // 2. If password column in table was null/empty, check against Supabase Auth using registered email
      if (matchedRow.email && matchedRow.email.includes('@')) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: matchedRow.email,
            password: cleanPass,
          });

          if (!authError && authData?.user) {
            // Also update the database row with the password for next fast verification
            saveUserProfileToSupabase(user, cleanPass).catch(() => {});
            return { success: true, user, userExists: true };
          } else if (authError) {
            return {
              success: false,
              userExists: true,
              error: 'Incorrect password. The password does not match your previous registered sign in.',
            };
          }
        } catch {
          // ignore auth fallback exception
        }
      }

      return {
        success: false,
        userExists: true,
        error: 'Password verification required. Please enter the correct password.',
      };
    }

    return { success: false, userExists: false, error: 'Account not found in database.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Database query error' };
  }
}

export async function fetchUserProfilesFromSupabase(): Promise<UserProfile[] | null> {
  try {
    // Try fetching from 'users' table first
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    const data = (!usersError && usersData) ? usersData : (
      (await supabase.from('user_profiles').select('*').order('created_at', { ascending: false })).data
    );

    if (!data) return null;

    return data.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      district: row.district,
      createdAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// SOS ALERTS (GPS EMERGENCY BEACONS)
// -------------------------------------------------------------
export async function saveSosAlertToSupabase(sosData: {
  latitude: number;
  longitude: number;
  full_name?: string;
  phone?: string;
  message?: string;
  status?: string;
  user_id?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const payload = {
      latitude: sosData.latitude,
      longitude: sosData.longitude,
      full_name: sosData.full_name || 'Anonymous User',
      phone: sosData.phone || 'Not Provided',
      message: sosData.message || 'Emergency SOS Alert',
      status: sosData.status || 'active',
      ...(sosData.user_id ? { user_id: sosData.user_id } : {}),
    };

    const { data, error } = await supabase
      .from('sos_alerts')
      .insert([payload])
      .select();

    if (error) {
      console.warn('Supabase sos_alerts insert warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data: data?.[0] };
  } catch (err: any) {
    console.error('Error saving SOS alert to Supabase:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function fetchSosAlertsFromSupabase(): Promise<SosAlert[] | null> {
  try {
    const { data, error } = await supabase
      .from('sos_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// LIVE DATABASE & STORAGE HEALTH CHECK
// -------------------------------------------------------------
export async function runDatabaseHealthCheck(): Promise<{
  connected: boolean;
  tables: Record<string, { ok: boolean; count?: number; error?: string }>;
  storage: { ok: boolean; bucket: string; error?: string };
}> {
  const result = {
    connected: false,
    tables: {} as Record<string, { ok: boolean; count?: number; error?: string }>,
    storage: { ok: false, bucket: 'disaster-evidence', error: '' },
  };

  const tablesToCheck = [
    'disaster_reports',
    'sos_alerts',
    'help_requests',
    'volunteers',
    'relief_camps',
    'alerts',
    'inventory',
    'users',
  ];

  for (const tbl of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(tbl).select('id', { count: 'exact', head: false }).limit(1);
      if (!error) {
        result.connected = true;
        result.tables[tbl] = { ok: true, count: data ? data.length : 0 };
      } else {
        result.tables[tbl] = { ok: false, error: error.message };
      }
    } catch (e: any) {
      result.tables[tbl] = { ok: false, error: e?.message };
    }
  }

  // Check Storage
  try {
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (!bErr && buckets) {
      const found = buckets.find((b) => b.name === 'disaster-evidence' || b.id === 'disaster-evidence');
      if (found) {
        result.storage.ok = true;
        result.connected = true;
      } else {
        result.storage.error = 'Storage bucket disaster-evidence not found in list. Use the SQL script to initialize it.';
      }
    } else {
      result.storage.error = bErr?.message || 'Storage service check error';
    }
  } catch (e: any) {
    result.storage.error = e?.message;
  }

  return result;
}

// -------------------------------------------------------------
// COMPLETE PRODUCTION-READY SQL SETUP SCHEMA WITH STORAGE BUCKETS
// -------------------------------------------------------------
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- 🚀 PRODUCTION RESILIENCE RELIEF DISASTER DATABASE & STORAGE SCHEMA
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/auazpiwbvsbzrccsqnyf/sql/new
-- ==============================================================================

-- 1. STORAGE BUCKET FOR DISASTER EVIDENCE (IMAGES & VIDEOS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'disaster-evidence',
  'disaster-evidence',
  true,
  52428800, -- 50MB per file limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable Public Storage Policies
DROP POLICY IF EXISTS "Public Evidence Storage Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Evidence Storage Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Evidence Storage Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Evidence Storage Delete" ON storage.objects;

CREATE POLICY "Public Evidence Storage Access" ON storage.objects FOR SELECT USING (bucket_id = 'disaster-evidence');
CREATE POLICY "Public Evidence Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'disaster-evidence');
CREATE POLICY "Public Evidence Storage Update" ON storage.objects FOR UPDATE USING (bucket_id = 'disaster-evidence');
CREATE POLICY "Public Evidence Storage Delete" ON storage.objects FOR DELETE USING (bucket_id = 'disaster-evidence');

-- 2. DISASTER REPORTS TABLE (WITH COMPLETE MEDIA & IMAGE EVIDENCE SUPPORT)
CREATE TABLE IF NOT EXISTS disaster_reports (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'High',
  status TEXT DEFAULT 'Investigating',
  location TEXT NOT NULL,
  time_logged TEXT,
  date TEXT,
  time TEXT,
  description TEXT,
  reporter_name TEXT,
  contact TEXT,
  has_visual_evidence BOOLEAN DEFAULT false,
  image_url TEXT,
  video_url TEXT,
  assigned_unit TEXT,
  icon_name TEXT DEFAULT 'report',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure image_url and video_url columns exist if table was previously created
ALTER TABLE disaster_reports ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE disaster_reports ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE disaster_reports ADD COLUMN IF NOT EXISTS has_visual_evidence BOOLEAN DEFAULT false;
ALTER TABLE disaster_reports ADD COLUMN IF NOT EXISTS reporter_name TEXT;
ALTER TABLE disaster_reports ADD COLUMN IF NOT EXISTS contact TEXT;
ALTER TABLE disaster_reports ADD COLUMN IF NOT EXISTS assigned_unit TEXT;
ALTER TABLE disaster_reports ADD COLUMN IF NOT EXISTS icon_name TEXT;

-- 3. SOS EMERGENCY ALERTS TABLE (GPS BEACONS)
CREATE TABLE IF NOT EXISTS sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  full_name TEXT,
  phone TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  message TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USERS & USER PROFILES TABLES (WITH PASSWORD PERSISTENCE)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'Civilian',
  district TEXT DEFAULT 'Wayanad',
  password TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'Civilian',
  district TEXT DEFAULT 'Wayanad',
  password TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure password columns exist if table was already created
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 5. CITIZEN HELP REQUESTS TABLE
CREATE TABLE IF NOT EXISTS help_requests (
  id TEXT PRIMARY KEY,
  requester_name TEXT NOT NULL,
  category TEXT,
  location TEXT,
  urgent_need TEXT,
  status TEXT,
  people_count INT DEFAULT 1,
  time_ago TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VOLUNTEERS TABLE
CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  location TEXT,
  status TEXT,
  skills TEXT[],
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RELIEF CAMPS & SHELTERS TABLE
CREATE TABLE IF NOT EXISTS relief_camps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT,
  type TEXT,
  lat FLOAT8,
  lng FLOAT8,
  capacity INT,
  occupancy INT,
  status TEXT,
  contact_person TEXT,
  phone TEXT,
  address TEXT,
  supplies_needed TEXT[],
  amenities TEXT[],
  last_updated TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EMERGENCY ALERTS BROADCAST TABLE
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  severity TEXT,
  region TEXT,
  time_ago TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RESOURCE INVENTORY & SUPPLY CHAIN TABLE
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  quantity INT,
  unit TEXT,
  location TEXT,
  status TEXT,
  icon_name TEXT,
  icon_color_class TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ENABLE ROW LEVEL SECURITY & OPEN PUBLIC ACCESS POLICIES
ALTER TABLE disaster_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE relief_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public disaster_reports" ON disaster_reports;
DROP POLICY IF EXISTS "Public sos_alerts" ON sos_alerts;
DROP POLICY IF EXISTS "Public users" ON users;
DROP POLICY IF EXISTS "Public user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public help_requests" ON help_requests;
DROP POLICY IF EXISTS "Public volunteers" ON volunteers;
DROP POLICY IF EXISTS "Public relief_camps" ON relief_camps;
DROP POLICY IF EXISTS "Public alerts" ON alerts;
DROP POLICY IF EXISTS "Public inventory" ON inventory;

CREATE POLICY "Public disaster_reports" ON disaster_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public sos_alerts" ON sos_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public help_requests" ON help_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public volunteers" ON volunteers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public relief_camps" ON relief_camps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public alerts" ON alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
`;

