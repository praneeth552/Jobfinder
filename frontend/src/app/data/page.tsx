'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmationModal from '@/components/ConfirmationModal';
import SimpleNavbar from '@/components/SimpleNavbar';

const DataDisplayItem = ({ label, value }) => (
    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
);

export default function ManageDataPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get('token');
      if (!token) {
        toast.error('You are not logged in.');
        router.push('/signin');
        return;
      }
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/me/data`, { headers: { Authorization: `Bearer ${token}` } });
        setUserData(data);
      } catch (error) {
        toast.error('Could not fetch your data.');
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleDeleteAccount = async () => {
    const token = Cookies.get('token');
    if (!token) {
      toast.error('You are not logged in.');
      return;
    }
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/user/me/delete`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Your account is scheduled for deletion. You have been logged out.');
      Cookies.remove('token');
      Cookies.remove('user_id');
      Cookies.remove('plan_type');
      router.push('/');
    } catch (error) {
      toast.error('Could not delete your account.');
    }
    setIsDeleteModalOpen(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
    <SimpleNavbar />
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto mt-20">
        <h1 className="text-3xl font-bold mb-6">Manage Your Data</h1>
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile Data</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This is a summary of the personal data we have stored for your account. 
          </p>
          {userData?.user_profile && (
            <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                <DataDisplayItem label="Name" value={userData.user_profile.name} />
                <DataDisplayItem label="Email" value={userData.user_profile.email} />
                <DataDisplayItem label="Plan" value={userData.user_profile.plan_type} />
                <DataDisplayItem label="Google Sheets Sync" value={userData.user_profile.sheets_enabled ? 'Enabled' : 'Disabled'} />
            </dl>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Your Preferences</h2>
            {userData?.user_profile?.preferences ? (
                 <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                    <DataDisplayItem label="Roles" value={userData.user_profile.preferences.role.join(', ')} />
                    <DataDisplayItem label="Locations" value={userData.user_profile.preferences.location.join(', ')} />
                    <DataDisplayItem label="Tech Stack" value={userData.user_profile.preferences.tech_stack.join(', ')} />
                 </dl>
            ) : <p>No preferences set.</p>}
        </div>

        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Your Resume Data</h2>
            {userData?.resume_data ? (
                 <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                    <DataDisplayItem label="Skills" value={userData.resume_data.skills.join(', ')} />
                    <DataDisplayItem label="Roles" value={userData.resume_data.roles.join(', ')} />
                 </dl>
            ) : <p>No resume data found.</p>}
        </div>

        <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Delete Your Account</h2>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                Once you delete your account, there is no going back. All of your data, including job applications and preferences, will be permanently removed after a 30-day grace period. Please be certain.
            </p>
            <div className="mt-6 flex justify-end">
                <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 font-semibold">
                    Request Account Deletion
                </button>
            </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Your Account?"
        message="Are you sure you want to permanently delete your account? This action cannot be undone, and your account will be scheduled for deletion in 30 days."
      />
    </div>
    </>
  );
}