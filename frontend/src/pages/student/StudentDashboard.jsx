import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, User, Settings, Lock } from 'lucide-react';

export default function StudentDashboard() {
    const { user, login } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('issues'); // issues, profile, security

    const [profileData, setProfileData] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    // States for forms
    const [profileForm, setProfileForm] = useState({ phone: '', branch: '', classroom: '', roll_no: '' });
    const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/students/me');
                setProfileData(data.profile);
                setIssues(data.active_issues);
                setProfileForm({
                    phone: data.profile.phone || '',
                    branch: data.profile.branch || '',
                    classroom: data.profile.classroom || '',
                    roll_no: data.profile.roll_no || '',
                });
            } catch (err) {
                showToast('Failed to load profile data', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [showToast]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/students/me/profile', profileForm);
            showToast('Profile updated successfully!', 'success');
            setProfileData(data.profile);
            // Update context cache
            login(localStorage.getItem('token'), data.profile);
        } catch (err) {
            showToast('Failed to update profile.', 'error');
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put('/students/me/password', passwordForm);
            showToast('Password updated successfully!', 'success');
            setPasswordForm({ current_password: '', new_password: '' });
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update password.', 'error');
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
                    Welcome back, {profileData.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500">Manage your active book loans and account settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-1">
                    <button onClick={() => setActiveTab('issues')} className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'issues' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900 hover:bg-gray-50'}`}>
                        <BookOpen className="h-5 w-5" /> My Books
                    </button>
                    <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900 hover:bg-gray-50'}`}>
                        <User className="h-5 w-5" /> Profile details
                    </button>
                    <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900 hover:bg-gray-50'}`}>
                        <Lock className="h-5 w-5" /> Security
                    </button>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    {activeTab === 'issues' && (
                        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">Active Book Issues</h3>
                            </div>
                            <ul className="divide-y divide-gray-200">
                                {issues.map(issue => (
                                    <li key={issue.issue_id} className="p-4 sm:px-6 hover:bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="text-sm font-medium text-indigo-600">{issue.book_name}</h4>
                                                <div className="mt-1 text-xs text-gray-500 flex flex-col gap-1">
                                                    <span>Issued: {issue.issue_date}</span>
                                                    <span className={new Date(issue.due_date) < new Date() ? 'text-red-600 font-medium' : ''}>Due: {issue.due_date}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {issue.current_fine > 0 && (
                                                    <div className="text-sm font-medium text-red-600">Fine: ${issue.current_fine.toFixed(2)}</div>
                                                )}
                                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mt-1">
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {issues.length === 0 && (
                                    <li className="p-8 text-center text-sm text-gray-500">You have no active book issues.</li>
                                )}
                            </ul>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">Profile Information</h3>
                            </div>
                            <div className="px-4 py-5 sm:p-6">
                                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Email Address (Read mode)</label>
                                        <input type="text" disabled value={profileData.email} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm text-gray-500 shadow-sm border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input type="text" required value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Branch</label>
                                        <input type="text" required value={profileForm.branch} onChange={e => setProfileForm({ ...profileForm, branch: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Classroom</label>
                                        <input type="text" required value={profileForm.classroom} onChange={e => setProfileForm({ ...profileForm, classroom: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Roll No</label>
                                        <input type="text" required value={profileForm.roll_no} onChange={e => setProfileForm({ ...profileForm, roll_no: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3" />
                                    </div>
                                    <div className="sm:col-span-2 flex justify-end">
                                        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">Change Password</h3>
                            </div>
                            <div className="px-4 py-5 sm:p-6">
                                <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                        <input type="password" required value={passwordForm.current_password} onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                                        <input type="password" required value={passwordForm.new_password} onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3" />
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Update Password</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
