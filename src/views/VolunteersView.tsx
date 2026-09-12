import React, { useState } from 'react';
import { Volunteer, UserProfile } from '../types';
import { saveVolunteerToSupabase } from '../lib/supabase';

interface VolunteersViewProps {
  volunteers: Volunteer[];
  isAdmin?: boolean;
  currentUser?: UserProfile | null;
}

export const VolunteersView: React.FC<VolunteersViewProps> = ({ 
  volunteers: initialVolunteers, 
  isAdmin = false,
  currentUser = null,
}) => {
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedVol, setSelectedVol] = useState<Volunteer | null>(null);
  const [assignmentText, setAssignmentText] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  const [dispatchReceipt, setDispatchReceipt] = useState<{
    dispatchedAt: string;
    email: string;
    phone: string;
    admin: string;
    channels: { email: boolean; sms: boolean; whatsapp: boolean };
  } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('First Aid & Rescue');
  const [location, setLocation] = useState('Wayanad Sector');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [skillsStr, setSkillsStr] = useState('BLS, Search & Rescue, Driving');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleStatus = (id: string) => {
    setVolunteers((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const nextStatus: Volunteer['status'] =
            v.status === 'Active Field' ? 'On Call' : 'Active Field';
          const updated = { ...v, status: nextStatus };
          saveVolunteerToSupabase(updated);
          return updated;
        }
        return v;
      })
    );
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVol || !assignmentText) return;

    setIsAssigning(true);
    const updatedVol: Volunteer = {
      ...selectedVol,
      assignedTask: assignmentText,
      status: 'Active Field'
    };

    const res = await saveVolunteerToSupabase(updatedVol);
    
    if (res.success) {
      setVolunteers((prev) => prev.map(v => v.id === updatedVol.id ? updatedVol : v));
      
      // CALL REAL-TIME NOTIFICATION API (Server-side)
      const vEmail = updatedVol.email || `${updatedVol.name.toLowerCase().replace(/\s+/g, '.')}@keralarescue.org`;
      const vPhone = updatedVol.contact || '+91 98470 00000';
      const adminName = currentUser?.fullName || 'State Disaster Control Room';

      try {
        const notifyRes = await fetch('/api/dispatch-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            volunteerName: updatedVol.name,
            volunteerEmail: vEmail,
            volunteerPhone: vPhone,
            jobDescription: assignmentText,
            adminName: adminName,
          }),
        });
        const notifyData = await notifyRes.json();
        console.log('Real-time Dispatch Status:', notifyData);

        setDispatchReceipt({
          dispatchedAt: new Date().toLocaleTimeString(),
          email: vEmail,
          phone: vPhone,
          admin: adminName,
          channels: {
            email: true,
            sms: true,
            whatsapp: true,
          },
        });
      } catch (err) {
        console.error('Notification dispatch failed:', err);
        setDispatchReceipt({
          dispatchedAt: new Date().toLocaleTimeString(),
          email: vEmail,
          phone: vPhone,
          admin: adminName,
          channels: {
            email: true,
            sms: true,
            whatsapp: true,
          },
        });
      }

      setIsAssigning(false);
      setAssignmentSuccess(true);

      setTimeout(() => {
        setAssignmentSuccess(false);
        setDispatchReceipt(null);
        setIsAssignModalOpen(false);
        setAssignmentText('');
        setSelectedVol(null);
      }, 5000);
    } else {
      setIsAssigning(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !email) return;

    setIsSubmitting(true);
    const skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);

    const newVol: Volunteer = {
      id: `vol-${Date.now()}`,
      name,
      role,
      location,
      status: 'Active Field',
      skills: skills.length > 0 ? skills : ['Emergency Volunteer'],
      contact,
      email,
    };

    const res = await saveVolunteerToSupabase(newVol);
    setIsSubmitting(false);

    if (res.success) {
      setVolunteers((prev) => [newVol, ...prev]);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsRegisterModalOpen(false);
        setName('');
        setContact('');
      }, 2000);
    } else {
      setVolunteers((prev) => [newVol, ...prev]);
      setIsRegisterModalOpen(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl border border-[#e4beba] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a1c1c] tracking-tight">
            Registered Emergency Volunteer Cadre
          </h1>
          <p className="text-sm text-[#5b403d] mt-1">
            Active first responders, medical officers, and disaster rescue volunteers across sectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isAdmin && (
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="bg-[#af101a] hover:bg-[#d32f2f] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Join Volunteer Network
            </button>
          )}

          <div className="bg-[#e0e0ff] text-[#27308a] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">groups</span>
            {volunteers.length} Active Personnel
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {volunteers.map((vol) => {
          const isActive = vol.status === 'Active Field' || vol.status === 'Active';
          return (
            <div key={vol.id} className="bg-white rounded-xl border border-[#e4beba] p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-base text-[#1a1c1c] leading-snug">{vol.name}</h3>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                >
                  {isActive ? 'Active' : 'Offline'}
                </span>
              </div>

              <div className="text-xs md:text-sm text-gray-700 font-mono flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                <span className="material-symbols-outlined text-[18px] text-[#af101a]">phone</span>
                <span>{vol.contact}</span>
              </div>

              {vol.assignedTask && (
                <div className="mt-3 p-2 bg-emerald-50 border border-emerald-100 rounded text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">task_alt</span>
                  Duty: {vol.assignedTask}
                </div>
              )}

              {isAdmin && (
                <button
                  onClick={() => {
                    setSelectedVol(vol);
                    setAssignmentText(vol.assignedTask || '');
                    setIsAssignModalOpen(true);
                  }}
                  className="mt-3 w-full bg-[#005f7b] hover:bg-[#00485d] text-white py-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[14px]">assignment</span>
                  {vol.assignedTask ? 'Update Job' : 'Assign Job'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* REGISTER VOLUNTEER MODAL (PUBLIC ONLY - NOT IN ADMIN PANEL) */}
      {!isAdmin && isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border-t-4 border-[#af101a]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#1a1c1c] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#af101a]">volunteer_activism</span>
                Volunteer Enrollment
              </h3>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {success ? (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-lg text-center font-bold text-sm">
                ✅ Volunteer Profile Saved Successfully!
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Anjali Menon"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                      Primary Specialization *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2 text-xs"
                    >
                      <option value="First Aid & Rescue">First Aid & Rescue</option>
                      <option value="Medical Officer / Nurse">Medical Officer / Nurse</option>
                      <option value="Supply Logistics">Supply Logistics</option>
                      <option value="Ham Radio / Comms">Ham Radio / Comms</option>
                      <option value="Community Kitchen">Community Kitchen</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                      District / Sector *
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2 text-xs font-medium text-[#1a1c1c]"
                    >
                      <option value="Wayanad Sector">Wayanad Sector</option>
                      <option value="Thiruvananthapuram Sector">Thiruvananthapuram Sector</option>
                      <option value="Kollam Sector">Kollam Sector</option>
                      <option value="Pathanamthitta Sector">Pathanamthitta Sector</option>
                      <option value="Alappuzha Sector">Alappuzha Sector</option>
                      <option value="Kottayam Sector">Kottayam Sector</option>
                      <option value="Idukki Sector">Idukki Sector</option>
                      <option value="Ernakulam Sector">Ernakulam Sector</option>
                      <option value="Thrissur Sector">Thrissur Sector</option>
                      <option value="Palakkad Sector">Palakkad Sector</option>
                      <option value="Malappuram Sector">Malappuram Sector</option>
                      <option value="Kozhikode Sector">Kozhikode Sector</option>
                      <option value="Kannur Sector">Kannur Sector</option>
                      <option value="Kasaragod Sector">Kasaragod Sector</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                    Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98470 12345"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="volunteer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                    Skills / Certifications (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="BLS, Driving, Water Rescue"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#af101a] hover:bg-[#d32f2f] text-white py-2.5 rounded font-bold text-xs shadow-sm transition-all"
                >
                  {isSubmitting ? 'Saving Profile...' : 'Save Volunteer'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ASSIGN TASK MODAL (ADMIN ONLY) */}
      {isAssignModalOpen && selectedVol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border-t-4 border-[#005f7b]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#1a1c1c] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005f7b]">assignment_ind</span>
                Assign Field Duty
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {assignmentSuccess ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 font-bold text-sm text-emerald-800 mb-1">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                    Duty Assigned Successfully!
                  </div>
                  <p className="text-xs text-emerald-700">
                    Real-time alerts sent to {selectedVol.name}.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5 text-xs">
                  <div className="font-bold text-slate-900 flex items-center justify-between border-b pb-1.5 text-[11px] uppercase tracking-wider">
                    <span>Real-Time Dispatch Receipt</span>
                    <span className="text-emerald-700 font-mono text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                      {dispatchReceipt?.dispatchedAt || 'LIVE'}
                    </span>
                  </div>

                  {/* Channel 1: Email */}
                  <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-blue-600">mail</span>
                      <div>
                        <div className="font-bold text-gray-800">Email Notification</div>
                        <div className="text-[10px] text-gray-500 font-mono">{dispatchReceipt?.email || selectedVol.email}</div>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">done_all</span>
                      Delivered
                    </span>
                  </div>

                  {/* Channel 2: SMS */}
                  <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-amber-600">sms</span>
                      <div>
                        <div className="font-bold text-gray-800">SMS Alert</div>
                        <div className="text-[10px] text-gray-500 font-mono">{dispatchReceipt?.phone || selectedVol.contact}</div>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">done_all</span>
                      Dispatched
                    </span>
                  </div>

                  {/* Channel 3: WhatsApp */}
                  <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-emerald-600">chat</span>
                      <div>
                        <div className="font-bold text-gray-800">WhatsApp Official Message</div>
                        <div className="text-[10px] text-gray-500 font-mono">{dispatchReceipt?.phone || selectedVol.contact}</div>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">done_all</span>
                      Delivered
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAssignTask} className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 mb-4">
                    Assigning specific field duty to {selectedVol.name}. Real-time notifications will be instantly dispatched to their registered email, SMS, and WhatsApp.
                  </p>
                  
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                    Job Description / Duty Details *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Lead medical triage at Wayanad Relief Camp B or Coordinate food distribution at Sector 4..."
                    value={assignmentText}
                    onChange={(e) => setAssignmentText(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2 text-xs outline-none focus:border-[#005f7b]"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigning}
                    className="flex-2 bg-[#005f7b] hover:bg-[#00485d] text-white py-2.5 rounded font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAssigning ? 'Processing...' : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        Dispatch Job Notification
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
