import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  initialTab?: 'edit-profile' | 'photo' | 'settings';
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
  initialTab = 'edit-profile'
}) => {
  const [activeTab, setActiveTab] = useState<'edit-profile' | 'photo' | 'settings'>(initialTab);
  
  // Local state for editing profile
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [district, setDistrict] = useState(currentUser?.district || '');

  // Sync state when currentUser changes or modal opens
  React.useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      setPhone(currentUser.phone || '');
      setDistrict(currentUser.district || '');
    }
  }, [currentUser]);

  // Local state for settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentUser,
      fullName,
      phone,
      district
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1a1c1c] text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#af101a]">manage_accounts</span>
            <h2 className="text-lg font-bold">Profile & Settings</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('edit-profile')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors flex justify-center items-center gap-2 ${
              activeTab === 'edit-profile' ? 'text-[#af101a] border-b-2 border-[#af101a]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            Profile
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors flex justify-center items-center gap-2 ${
              activeTab === 'photo' ? 'text-[#af101a] border-b-2 border-[#af101a]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            Photo
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors flex justify-center items-center gap-2 ${
              activeTab === 'settings' ? 'text-[#af101a] border-b-2 border-[#af101a]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'edit-profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#af101a] focus:border-transparent outline-none"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg p-2.5 text-sm cursor-not-allowed"
                  value={currentUser?.email || ''}
                />
                <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#af101a] focus:border-transparent outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">District</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#af101a] focus:border-transparent outline-none bg-white"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    <option value="">Select District</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                    <option value="Kollam">Kollam</option>
                    <option value="Pathanamthitta">Pathanamthitta</option>
                    <option value="Alappuzha">Alappuzha</option>
                    <option value="Kottayam">Kottayam</option>
                    <option value="Idukki">Idukki</option>
                    <option value="Ernakulam">Ernakulam</option>
                    <option value="Thrissur">Thrissur</option>
                    <option value="Palakkad">Palakkad</option>
                    <option value="Malappuram">Malappuram</option>
                    <option value="Kozhikode">Kozhikode</option>
                    <option value="Wayanad">Wayanad</option>
                    <option value="Kannur">Kannur</option>
                    <option value="Kasaragod">Kasaragod</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-6 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-[#af101a] text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'photo' && (
            <div className="flex flex-col items-center py-6 space-y-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-[#af101a] text-white font-bold text-4xl flex items-center justify-center shadow-lg border-4 border-white outline outline-1 outline-gray-200">
                  {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <button className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-2 shadow-sm hover:bg-gray-50 text-gray-700 transition-colors" title="Upload new photo">
                  <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
                </button>
              </div>
              
              <div className="text-center space-y-1">
                <h3 className="font-bold text-gray-900">Profile Photo</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Upload a clear, front-facing photo to help responders and volunteers identify you in the field.
                </p>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Upload
                </button>
                <button className="px-4 py-2 text-sm font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Remove
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider border-b pb-1">Notifications</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <div className="text-sm font-bold text-gray-800">Push Notifications</div>
                      <div className="text-xs text-gray-500">Receive alerts on this device for critical updates.</div>
                    </div>
                    <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`} onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <div className="text-sm font-bold text-gray-800">SMS Alerts</div>
                      <div className="text-xs text-gray-500">Receive text messages for regional emergencies.</div>
                    </div>
                    <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${smsAlertsEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`} onClick={() => setSmsAlertsEnabled(!smsAlertsEnabled)}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${smsAlertsEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider border-b pb-1 mt-6">Account Security</h3>
                <button className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">password</span>
                  Change Password
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-100 mt-6 flex justify-end">
                <button onClick={onClose} className="px-5 py-2 text-sm font-bold bg-[#af101a] text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
