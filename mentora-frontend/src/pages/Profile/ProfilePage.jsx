import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Lock,
  Save,
} from 'lucide-react';

import authService from '../../services/authService';
import Spinner from '../../components/common/Spinner';
import { toast } from "react-hot-toast";
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    username: '',
    email: '',
    createdAt: '',
  });

  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await authService.getProfile();

      const user = response.data;

      setProfile(user);

      setProfileForm({
        username: user.username || '',
        email: user.email || '',
      });
    } catch (error) {
      console.error(error);
      alert(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);

      const response = await authService.updateProfile(
        profileForm
      );

      setProfile(response.data);
      updateUser(response.data);

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      return toast.error('Passwords do not match');
    }

    try {
      setChangingPassword(true);

      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <Spinner text="Loading profile..." />;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Profile Settings
        </h1>

        <p className="text-gray-500 mt-2">
          Manage your account information and security.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="bg-white border rounded-xl p-6 h-fit">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <User
                className="text-emerald-600"
                size={36}
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-center">
            {profile.username}
          </h2>

          <p className="text-gray-500 text-center">
            {profile.email}
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} />
              {profile.email}
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} />
              Joined{' '}
              {new Date(
                profile.createdAt
              ).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-5">
              Personal Information
            </h2>

            <form
              onSubmit={saveProfile}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg"
              >
                <Save size={18} />
                {savingProfile
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Lock size={18} />
              Change Password
            </h2>

            <form
              onSubmit={updatePassword}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Password
                </label>

                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>

                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-lg"
              >
                <Lock size={18} />
                {changingPassword
                  ? 'Updating...'
                  : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;