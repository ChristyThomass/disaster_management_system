import React, { useState, useEffect } from 'react';
import {
  supabase,
  saveUserProfileToSupabase,
  verifyUserCredentialsInSupabase,
  fetchUserProfilesFromSupabase,
} from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  onNavigateToAdmin?: () => void;
  onNavigateToPublic?: () => void;
  onSignInSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  setCurrentUser,
  onNavigateToAdmin,
  onNavigateToPublic,
  onSignInSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up (Create Account) state
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'Civilian' | 'Volunteer'>('Civilian');
  const [district, setDistrict] = useState('Wayanad');

  // UI status state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear messages and input fields on modal open or tab toggle
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (isOpen) {
      setSignInEmail('');
      setSignInPassword('');
      setSignUpPassword('');
      setConfirmPassword('');
    }
  }, [mode, isOpen]);

  if (!isOpen) return null;

  // HANDLE SIGN IN
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const inputVal = signInEmail.trim();
      const passVal = signInPassword.trim();

      if (!inputVal) {
        setErrorMsg('Please enter your username, email, or registered phone number.');
        setLoading(false);
        return;
      }

      if (!passVal) {
        setErrorMsg('Please enter your account password.');
        setLoading(false);
        return;
      }

      // FIXED ADMIN CREDENTIAL CHECK
      if (inputVal === 'admin@123' && passVal === 'admin123') {
        const adminUser: UserProfile = {
          id: 'admin-001',
          email: 'admin@123',
          fullName: 'System Administrator',
          role: 'Administrator',
          district: 'State Command Center',
        };
        setCurrentUser(adminUser);
        localStorage.setItem('resilience_user', JSON.stringify(adminUser));
        setSuccessMsg('⚡ Admin credentials verified! Opening Admin Panel...');
        setSignInEmail('');
        setSignInPassword('');
        if (onSignInSuccess) {
          onSignInSuccess();
        }

        setTimeout(() => {
          onClose();
          if (onNavigateToAdmin) {
            onNavigateToAdmin();
          }
        }, 800);
        return;
      }

      // Rejection if username is admin@123 but password is wrong
      if (inputVal === 'admin@123' && passVal !== 'admin123') {
        setErrorMsg('Incorrect password. Please enter the correct administrator password.');
        setLoading(false);
        return;
      }

      // Check local registered accounts map in localStorage
      let localAccounts: Record<string, { profile: UserProfile; passwordHash?: string }> = {};
      try {
        const stored = localStorage.getItem('resilience_registered_users');
        if (stored) {
          localAccounts = JSON.parse(stored);
        }
      } catch {
        // ignore parse error
      }

      const normalizedInput = inputVal.toLowerCase();

      // 1. First, check username/email & password against Supabase Database
      const supabaseCheck = await verifyUserCredentialsInSupabase(inputVal, passVal);
      if (supabaseCheck.success && supabaseCheck.user) {
        setCurrentUser(supabaseCheck.user);
        localStorage.setItem('resilience_user', JSON.stringify(supabaseCheck.user));
        setSuccessMsg(`Welcome back, ${supabaseCheck.user.fullName}! Credentials verified in Supabase.`);
        setSignInEmail('');
        setSignInPassword('');
        if (onSignInSuccess) {
          onSignInSuccess();
        }

        setTimeout(() => {
          onClose();
          if (onNavigateToPublic) {
            onNavigateToPublic();
          }
        }, 800);
        return;
      }

      // If user was found in Supabase database but the password did NOT match:
      if (supabaseCheck.userExists && !supabaseCheck.success) {
        setErrorMsg(supabaseCheck.error || 'Incorrect password. The password does not match your previous registered sign in.');
        setLoading(false);
        return;
      }

      // 2. Check local accounts cache for offline / instant session match
      const localMatchKey = Object.keys(localAccounts).find(
        (k) =>
          k.toLowerCase() === normalizedInput ||
          localAccounts[k]?.profile?.email?.toLowerCase() === normalizedInput ||
          localAccounts[k]?.profile?.fullName?.toLowerCase() === normalizedInput
      );

      if (localMatchKey) {
        const record = localAccounts[localMatchKey];
        if (record.passwordHash === passVal) {
          const authUser = record.profile;
          setCurrentUser(authUser);
          localStorage.setItem('resilience_user', JSON.stringify(authUser));
          setSuccessMsg(`Welcome back, ${authUser.fullName}! Signed in successfully.`);
          setSignInEmail('');
          setSignInPassword('');
          if (onSignInSuccess) {
            onSignInSuccess();
          }

          setTimeout(() => {
            onClose();
            if (onNavigateToPublic) {
              onNavigateToPublic();
            }
          }, 800);
          return;
        } else {
          setErrorMsg('Incorrect password. The password does not match your registered account.');
          setLoading(false);
          return;
        }
      }

      // 3. Attempt Supabase Auth sign in if an email format is provided
      if (inputVal.includes('@')) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: inputVal,
            password: passVal,
          });

          if (!authError && authData?.user) {
            const metadata = authData.user.user_metadata || {};
            const authUser: UserProfile = {
              id: authData.user.id,
              email: authData.user.email || inputVal,
              fullName: metadata.full_name || inputVal.split('@')[0],
              role: metadata.role || 'Civilian',
              district: metadata.district || 'Wayanad',
              phone: metadata.phone || '',
            };
            setCurrentUser(authUser);
            localStorage.setItem('resilience_user', JSON.stringify(authUser));
            setSuccessMsg(`Welcome back, ${authUser.fullName}!`);
            setSignInEmail('');
            setSignInPassword('');
            if (onSignInSuccess) {
              onSignInSuccess();
            }

            setTimeout(() => {
              onClose();
              if (onNavigateToPublic) {
                onNavigateToPublic();
              }
            }, 800);
            return;
          } else if (authError) {
            if (authError.message.toLowerCase().includes('invalid login credentials') || authError.message.toLowerCase().includes('password')) {
              setErrorMsg('Incorrect password or username. Please check your credentials.');
              setLoading(false);
              return;
            }
          }
        } catch {
          // ignore
        }
      }

      // 4. Account not found anywhere in database
      setErrorMsg('No account found matching this username or email. Please click "Register / Create Account" below to register.');
    } catch (err: any) {
      setErrorMsg('Error signing in: ' + (err.message || 'Please check your username and password.'));
    } finally {
      setLoading(false);
    }
  };

  // HANDLE CREATE ACCOUNT (SIGN UP)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (signUpPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password.');
      setLoading(false);
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            full_name: fullName,
            role,
            district,
            phone,
          },
        },
      });

      // Save user profile locally, to state, and to Supabase user_profiles and users tables with password
      const newProfile: UserProfile = {
        id: data?.user?.id || `usr-${Date.now()}`,
        email: signUpEmail,
        fullName: fullName || 'New Member',
        role,
        district,
        phone,
        createdAt: new Date().toISOString(),
      };

      // Upsert profile along with password into Supabase tables
      await saveUserProfileToSupabase(newProfile, signUpPassword);

      // Also upsert profile to Supabase volunteers table if role is Volunteer
      if (role === 'Volunteer') {
        await supabase.from('volunteers').upsert({
          id: newProfile.id,
          name: fullName,
          role: 'Community Volunteer',
          location: `${district} Sector`,
          status: 'Active Field',
          skills: ['First Aid', 'Emergency Dispatch'],
          contact: phone || signUpEmail,
          created_at: new Date().toISOString(),
        });
      }

      setCurrentUser(newProfile);
      localStorage.setItem('resilience_user', JSON.stringify(newProfile));

      // Persist in local registered accounts map for fast offline/online verification
      try {
        const stored = localStorage.getItem('resilience_registered_users');
        const accountsMap = stored ? JSON.parse(stored) : {};
        accountsMap[signUpEmail.toLowerCase()] = {
          profile: newProfile,
          passwordHash: signUpPassword,
        };
        if (fullName) {
          accountsMap[fullName.toLowerCase()] = {
            profile: newProfile,
            passwordHash: signUpPassword,
          };
        }
        localStorage.setItem('resilience_registered_users', JSON.stringify(accountsMap));
      } catch {
        // ignore
      }

      if (error) {
        console.warn('Supabase signUp notice:', error.message);
        setSuccessMsg(`Account created for ${fullName}! Saved in database with password.`);
      } else {
        setSuccessMsg(`Account created successfully! Welcome, ${fullName}.`);
      }

      if (onSignInSuccess) {
        onSignInSuccess();
      }

      setTimeout(() => {
        onClose();
        if (onNavigateToPublic) {
          onNavigateToPublic();
        }
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    setCurrentUser(null);
    localStorage.removeItem('resilience_user');
    setMode('signin');
    setSignInEmail('');
    setSignInPassword('');
    setErrorMsg(null);
    if (onNavigateToPublic) {
      onNavigateToPublic();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-[#e4beba] animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffdad6] text-[#af101a] flex items-center justify-center shrink-0 font-bold">
              <span className="material-symbols-outlined text-[24px]">account_circle</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1a1c1c]">
                {mode === 'signup' ? 'Create New Account' : 'Sign In to Account'}
              </h3>
              <p className="text-xs text-[#5b403d]">
                Smart Disaster Management System • Secure Access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* LOGGED IN STATUS BANNER (if currently authenticated) */}
        {currentUser && (
          <div className="bg-[#ffdad6]/40 border border-[#e4beba] rounded-xl p-3 mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#af101a] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {currentUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#1a1c1c] truncate">{currentUser.fullName}</span>
                  <span className="bg-[#af101a] text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 truncate font-mono">{currentUser.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-[#af101a] hover:bg-[#d32f2f] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs shrink-0"
              title="Sign out and switch account"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              Sign Out
            </button>
          </div>
        )}

        {/* TAB SWITCHER */}
        <div className="flex border-b border-gray-200 mb-5">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 pb-2 text-xs md:text-sm font-bold transition-all border-b-2 ${
              mode === 'signin'
                ? 'border-[#af101a] text-[#af101a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign In to Account
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 pb-2 text-xs md:text-sm font-bold transition-all border-b-2 ${
              mode === 'signup'
                ? 'border-[#af101a] text-[#af101a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* ERROR AND SUCCESS ALERTS */}
        {errorMsg && (
          <div className="bg-[#ffdad6] text-[#93000a] border border-[#ffb3ac] p-3 rounded-lg text-xs mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
            {errorMsg.includes('create an account') && (
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className="underline font-bold text-[#af101a] hover:text-[#7f0011] shrink-0 text-xs ml-2 cursor-pointer"
              >
                Create Account
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 p-3 rounded-lg text-xs mb-4 flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

            {/* FORM: CREATE ACCOUNT (SIGN UP) */}
            {mode === 'signup' ? (
              <form onSubmit={handleSignUp} className="space-y-3" autoComplete="off">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                    Full Name / Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#af101a]/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Enter email address"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#af101a]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#af101a]/20 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                      User Account Role *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#af101a]/20 outline-none font-medium"
                    >
                      <option value="Civilian">General User</option>
                      <option value="Volunteer">Volunteer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                      District / Region *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#af101a]/20 outline-none font-medium text-[#1a1c1c]"
                    >
                      <option value="Wayanad">Wayanad Sector</option>
                      <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                      <option value="Kollam">Kollam</option>
                      <option value="Pathanamthitta">Pathanamthitta</option>
                      <option value="Alappuzha">Alappuzha</option>
                      <option value="Kottayam">Kottayam</option>
                      <option value="Idukki">Idukki (High-Range)</option>
                      <option value="Ernakulam">Ernakulam</option>
                      <option value="Thrissur">Thrissur</option>
                      <option value="Palakkad">Palakkad</option>
                      <option value="Malappuram">Malappuram</option>
                      <option value="Kozhikode">Kozhikode</option>
                      <option value="Kannur">Kannur</option>
                      <option value="Kasaragod">Kasaragod</option>
                      <option value="Other">Other Region / Outside Kerala</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                      Password (min 6 chars) *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#af101a]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#af101a]/20 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[#af101a] hover:bg-[#d32f2f] text-white py-2.5 rounded-lg font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  {loading ? 'Creating Account...' : 'Create Account (Sign Up)'}
                </button>
              </form>
            ) : (
              /* FORM: SIGN IN */
              <form onSubmit={handleSignIn} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                    Username / Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Enter Username or Full Name"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-[#af101a]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-[#af101a]/20 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#af101a] hover:bg-[#d32f2f] text-white py-2.5 rounded-lg font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            )}

            <div className="text-center mt-4 pt-3 border-t border-gray-100">
              <p className="text-[11px] text-gray-500">
                Connected to Regional Emergency System
              </p>
            </div>
      </div>
    </div>
  );
};
