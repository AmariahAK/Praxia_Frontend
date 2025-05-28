"use client";

import { useState, useEffect, useRef } from 'react';
import { profileApi, authApi } from '@/api/api';
import { UserProfile as UserProfileType, TOTPSetupResponse } from '@/types/user';
import { useProfile } from '@/components/contexts/ProfileContext';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface UserProfileProps {
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { profile, setProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfileType>>({});
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const [totpData, setTotpData] = useState<TOTPSetupResponse | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [has2FA, setHas2FA] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!profile) {
        setLoading(true);
        try {
          const data = await profileApi.getProfile();
          setProfile(data);
          setFormData(data);
          
          // Check 2FA status
          const totpStatus = await authApi.checkTOTPStatus();
          setHas2FA(totpStatus.has_2fa);
        } catch (error) {
          console.error('Error fetching profile:', error);
          toast.error('Failed to load profile');
        } finally {
          setLoading(false);
        }
      } else {
        setFormData(profile);
        // Still check 2FA status
        try {
          const totpStatus = await authApi.checkTOTPStatus();
          setHas2FA(totpStatus.has_2fa);
        } catch (error) {
          console.error('Error checking 2FA status:', error);
        }
      }
    };

    fetchProfileData();
  }, [profile, setProfile]);

  useEffect(() => {
    // Handle clicking outside the modal to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle file selection for profile picture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedData: Partial<UserProfileType> = {};
      
      // Only include fields that have changed
      if (profile?.age !== formData.age) updatedData.age = formData.age;
      if (profile?.gender !== formData.gender) updatedData.gender = formData.gender;
      if (profile?.weight !== formData.weight) updatedData.weight = formData.weight;
      if (profile?.height !== formData.height) updatedData.height = formData.height;
      if (profile?.country !== formData.country) updatedData.country = formData.country;
      if (profile?.allergies !== formData.allergies) updatedData.allergies = formData.allergies;
      if (profile?.preferred_language !== formData.preferred_language) 
        updatedData.preferred_language = formData.preferred_language;
      
      // Only update profile if there are changes
      let updatedProfile = profile;
      if (Object.keys(updatedData).length > 0) {
        updatedProfile = await profileApi.updateProfile(updatedData);
      }
      
      // Then upload profile picture if changed
      if (profileImage) {
        updatedProfile = await profileApi.uploadProfilePicture(profileImage);
      }
      
      // Update the context with the new profile data
      setProfile(updatedProfile);
      setEditMode(false);
      setPreviewUrl(null);
      setProfileImage(null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmGender = async () => {
    if (!profile?.gender) {
      toast.error('Please select a gender before confirming');
      return;
    }

    try {
      setSaving(true);
      const response = await profileApi.confirmGender();
      setProfile(response.profile);
      toast.success(response.detail);
    } catch (error) {
      console.error('Error confirming gender:', error);
      toast.error('Failed to confirm gender');
    } finally {
      setSaving(false);
    }
  };

  const setupTOTP = async () => {
    try {
      setLoading(true);
      const data = await authApi.setupTOTP();
      setTotpData(data);
      setShowTOTPSetup(true);
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast.error('Failed to set up 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (totpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      setSaving(true);
      const response = await authApi.verifyTOTP({ token: totpCode });
      if (response.is_verified) {
        setHas2FA(true);
        setShowTOTPSetup(false);
        toast.success('Two-factor authentication enabled successfully');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error('Failed to verify code');
    } finally {
      setSaving(false);
    }
  };

  const disableTOTP = async () => {
    try {
      setSaving(true);
      await authApi.disableTOTP();
      setHas2FA(false);
      toast.success('Two-factor authentication disabled');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Failed to disable 2FA');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-base p-8 rounded-lg shadow-lg max-w-2xl w-full" ref={modalRef}>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base p-8 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" ref={modalRef}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold primary-text">Your Profile</h2>
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {profile && (
          <form onSubmit={handleSubmit}>
            <div className="mb-8 flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                {(previewUrl || profile.profile_picture) ? (
                  <Image 
                    src={previewUrl || profile.profile_picture || '/images/default-avatar.png'} 
                    alt="Profile" 
                    className="rounded-full object-cover"
                    fill
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-neutral flex items-center justify-center">
                    <span className="text-4xl text-primary">{profile.username.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                
                {editMode && (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              
              <h3 className="text-xl font-semibold">{profile.username}</h3>
              <p className="text-text-secondary flex items-center">
                {profile.email}
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                  Verified
                </span>
              </p>
            </div>

            {/* Rest of your form remains the same... */}
            {/* I'll keep the rest of the component as is since it's quite long */}
            {/* Just make sure to keep all the existing form fields and 2FA setup */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Keep all your existing form fields here */}
              <div>
                <label className="block text-text-secondary mb-2">Age</label>
                {editMode ? (
                  <input
                    type="number"
                    name="age"
                    value={formData.age || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-neutral rounded-md bg-base"
                  />
                ) : (
                  <p>{profile.age || 'Not specified'}</p>
                )}
              </div>

              {/* Continue with all your other form fields... */}
              {/* Gender, Weight, Height, Country, Language, Allergies */}
              {/* Keep the existing implementation */}
            </div>

            {/* Keep your 2FA section and form buttons */}
            <div className="border-t border-neutral pt-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-text-secondary">Add an extra layer of security to your account</p>
                </div>
                {has2FA ? (
                  <button
                    type="button"
                    onClick={disableTOTP}
                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                    disabled={saving}
                  >
                    {saving ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={setupTOTP}
                    className="px-4 py-2 bg-primary text-white rounded-md"
                    disabled={saving}
                  >
                    {saving ? 'Setting up...' : 'Enable 2FA'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              {editMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData(profile);
                      setPreviewUrl(null);
                      setProfileImage(null);
                    }}
                    className="px-4 py-2 border border-neutral rounded-md"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-md"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-primary text-white rounded-md"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-text-secondary mb-2">Gender</label>
                {editMode && !profile.gender_locked ? (
                  <select
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-neutral rounded-md bg-base"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                ) : (
                  <div className="flex items-center">
                    <p>{profile.gender || 'Not specified'}</p>
                    {profile.gender && !profile.gender_locked && (
                      <button
                        type="button"
                        onClick={handleConfirmGender}
                        className="ml-2 text-xs px-2 py-1 bg-primary text-white rounded-md"
                        disabled={saving}
                      >
                        Confirm
                      </button>
                    )}
                    {profile.gender_locked && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">
                        Locked
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-text-secondary mb-2">Weight (kg)</label>
                {editMode ? (
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-neutral rounded-md bg-base"
                    step="0.1"
                  />
                ) : (
                  <p>{profile.weight || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary mb-2">Height (cm)</label>
                {editMode ? (
                  <input
                    type="number"
                    name="height"
                    value={formData.height || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-neutral rounded-md bg-base"
                    step="0.1"
                  />
                ) : (
                  <p>{profile.height || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary mb-2">Country</label>
                {editMode ? (
                  <input
                    type="text"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-neutral rounded-md bg-base"
                  />
                ) : (
                  <p>{profile.country || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary mb-2">Preferred Language</label>
                {editMode ? (
                  <select
                    name="preferred_language"
                    value={formData.preferred_language || 'en'}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-neutral rounded-md bg-base"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                ) : (
                  <p>
                    {profile.preferred_language === 'en' ? 'English' : 
                     profile.preferred_language === 'es' ? 'Spanish' : 
                     profile.preferred_language === 'fr' ? 'French' : 'English (Default)'}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-text-secondary mb-2">Allergies</label>
                {editMode ? (
                  <textarea
                    name="allergies"
                    value={formData.allergies || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-neutral rounded-md bg-base"
                    rows={3}
                  />
                ) : (
                  <p>{profile.allergies || 'None specified'}</p>
                )}
              </div>
            </div>
          </form>
        )}

        {showTOTPSetup && totpData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base p-8 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Set Up Two-Factor Authentication</h3>
              
              <p className="mb-4">Scan this QR code with your authenticator app (like Google Authenticator or Authy):</p>
              
              <div className="flex justify-center mb-6">
                <Image 
                  src={totpData.qr_code} 
                  alt="2FA QR Code" 
                  width={200} 
                  height={200}
                  className="border border-neutral rounded-md"
                />
              </div>
              
              <p className="mb-4">Enter the 6-digit code from your authenticator app:</p>
              
              <input
                type="text"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full p-2 border border-neutral rounded-md bg-base mb-4"
                placeholder="000000"
                maxLength={6}
              />
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowTOTPSetup(false)}
                  className="px-4 py-2 border border-neutral rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={verifyTOTP}
                  className="px-4 py-2 bg-primary text-white rounded-md"
                  disabled={saving || totpCode.length !== 6}
                >
                  {saving ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
