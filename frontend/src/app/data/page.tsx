'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Briefcase, FileText, Trash2, LucideIcon } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmationModal from '@/components/ConfirmationModal';
import SimpleNavbar from '@/components/SimpleNavbar';

const DataDisplayItem = ({ label, value }: { label: string; value: any }) => (
  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-[--foreground]/60">{label}</dt>
    <dd className="mt-1 text-sm text-[--foreground] sm:mt-0 sm:col-span-2">{value || 'Not set'}</dd>
  </div>
);

const SectionCard = ({
  title,
  icon: IconComponent,
  children
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-[--border] bg-[--card-background] p-6"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-xl bg-[--foreground]/5">
        <IconComponent size={20} className="text-[--foreground]/70" />
      </div>
      <h2 className="text-xl font-semibold text-[--foreground]">{title}</h2>
    </div>
    {children}
  </motion.div>
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
      <div className="min-h-screen bg-[--background] text-[--foreground] p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto mt-20 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[--foreground]"
          >
            Manage Your Data
          </motion.h1>
          <p className="text-[--foreground]/60">
            View and manage all the personal data we have stored for your account.
          </p>

          {/* Profile Section */}
          <SectionCard title="Your Profile" icon={User}>
            {userData?.user_profile ? (
              <dl className="divide-y divide-[--border]">
                <DataDisplayItem label="Name" value={userData.user_profile.name} />
                <DataDisplayItem label="Email" value={userData.user_profile.email} />
                <DataDisplayItem label="Plan" value={userData.user_profile.plan_type} />
                <DataDisplayItem label="Google Sheets Sync" value={userData.user_profile.sheets_enabled ? 'Enabled' : 'Disabled'} />
              </dl>
            ) : (
              <p className="text-[--foreground]/50">No profile data found.</p>
            )}
          </SectionCard>

          {/* Preferences Section */}
          <SectionCard title="Your Preferences" icon={Briefcase}>
            {userData?.user_profile?.preferences ? (
              <dl className="divide-y divide-[--border]">
                <DataDisplayItem label="Roles" value={userData.user_profile.preferences.role?.join(', ')} />
                <DataDisplayItem label="Locations" value={userData.user_profile.preferences.location?.join(', ')} />
                <DataDisplayItem label="Tech Stack" value={userData.user_profile.preferences.tech_stack?.join(', ')} />
              </dl>
            ) : (
              <p className="text-[--foreground]/50">No preferences set.</p>
            )}
          </SectionCard>

          {/* Resume Section */}
          <SectionCard title="Your Resume Data" icon={FileText}>
            {userData?.resume_data ? (
              <dl className="divide-y divide-[--border]">
                <DataDisplayItem label="Skills" value={userData.resume_data.skills?.join(', ')} />
                <DataDisplayItem label="Roles" value={userData.resume_data.roles?.join(', ')} />
              </dl>
            ) : (
              <p className="text-[--foreground]/50">No resume data found.</p>
            )}
          </SectionCard>

          {/* Delete Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[--foreground]/20 bg-[--foreground]/5 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[--foreground]/10">
                <Trash2 size={20} className="text-[--foreground]/70" />
              </div>
              <h2 className="text-xl font-semibold text-[--foreground]">Delete Your Account</h2>
            </div>
            <p className="text-sm text-[--foreground]/60 mb-4">
              Once you delete your account, all of your data will be permanently removed after a 30-day grace period. This action cannot be undone.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 rounded-full text-[--background] bg-[--foreground] hover:opacity-90 font-medium transition-opacity"
              >
                Request Account Deletion
              </button>
            </div>
          </motion.div>
        </div>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Your Account?"
          message="Are you sure you want to permanently delete your account? This action cannot be undone, and your account will be scheduled for deletion in 30 days."
          confirmText="Delete Account"
        />
      </div>
    </>
  );
}