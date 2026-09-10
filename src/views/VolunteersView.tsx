import React, { useState } from 'react';
import { Volunteer } from '../types';
import { saveVolunteerToSupabase } from '../lib/supabase';

interface VolunteersViewProps {
  volunteers: Volunteer[];
}

export const VolunteersView: React.FC<VolunteersViewProps> = ({ volunteers: initialVolunteers }) => {
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('First Aid & Rescue');
  const [location, setLocation] = useState('Wayanad Sector');
  const [contact, setContact] = useState('');
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;

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
            Volunteer Network & Field Operations
          </h1>
          <p className="text-sm text-[#5b403d] mt-1">
            Deploy trained personnel and crisis specialists across active sectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="bg-[#af101a] hover:bg-[#d32f2f] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Register as Volunteer
          </button>

          <div className="bg-[#e0e0ff] text-[#27308a] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">groups</span>
            {volunteers.length} Active Volunteers
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
            </div>
          );
        })}
      </div>

      {/* REGISTER VOLUNTEER MODAL */}
      {isRegisterModalOpen && (
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
                    Phone / Contact *
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
                    Skills / Certifications (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="BLS, Driving, Water Rescue, Tamil, Malayalam"
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
    </main>
  );
};

