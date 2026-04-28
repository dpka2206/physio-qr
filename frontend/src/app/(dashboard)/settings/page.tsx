'use client';
import { useState, useRef } from 'react';
import { useDoctor } from '@/contexts/DoctorContext';
import { useToast } from '@/components/ToastProvider';
import { fetchAPI } from '@/lib/api';

export default function Settings() {
    const { doctor, refreshDoctor } = useDoctor();
    const { showToast } = useToast();

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        const updates = Object.fromEntries(fd.entries());

        try {
            await fetchAPI('/doctors/me', {
                method: 'PATCH',
                body: JSON.stringify(updates)
            });
            await refreshDoctor();
            showToast("Profile updated successfully");
        } catch (err: any) {
            showToast("Failed to save profile: " + err.message);
        } finally {
            setSaving(false);
        }
    }

    const fileInput = useRef<HTMLInputElement>(null);
    const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);

        try {
            const token = localStorage.getItem('supabase_token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/doctors/logo`, {
                method: 'POST',
                body: fd,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Upload failed");
            await refreshDoctor();
            showToast("Logo updated successfully");
        } catch (err: any) {
            showToast("Upload error: " + err.message);
        } finally {
            // Reset input so they can upload same file if it failed
            if (fileInput.current) fileInput.current.value = '';
            setUploading(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-8 pb-10">
            <div className="bg-white border border-gray-200 text-gray-900 rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 p-5 bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">Doctor Profile</h3>
                    <p className="text-sm text-gray-500 mt-1">Update your personal information and clinical registration details.</p>
                </div>
                <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                            <input type="text" name="full_name" defaultValue={doctor?.full_name || ''} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white text-gray-900 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Clinic Name</label>
                            <input type="text" name="clinic_name" defaultValue={doctor?.clinic_name || ''} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white text-gray-900 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Clinic Address</label>
                            <input type="text" name="clinic_address" defaultValue={doctor?.clinic_address || ''} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white text-gray-900 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                            <input type="text" name="city" defaultValue={doctor?.city || ''} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white text-gray-900 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">License Number</label>
                            <input type="text" name="license_no" defaultValue={doctor?.license_no || ''} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white text-gray-900 shadow-sm" />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialisation</label>
                            <input type="text" name="specialisation" defaultValue={doctor?.specialisation || ''} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white text-gray-900 shadow-sm" />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button disabled={saving} type="submit" className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm">
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm text-gray-900 overflow-hidden">
                <div className="border-b border-gray-100 p-5 bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">Clinic Logo</h3>
                    <p className="text-sm text-gray-500 mt-1">Upload a logo to appear on printed and public prescriptions.</p>
                </div>
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="w-24 h-24 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {doctor?.logo_url ? (
                                <img src={doctor.logo_url} alt="Clinic Logo" className="w-full h-full object-contain p-2 bg-white" />
                            ) : (
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            )}
                        </div>
                        <div>
                            <input type="file" ref={fileInput} className="hidden" accept="image/*" onChange={handleUploadLogo} />
                            <button onClick={() => fileInput.current?.click()} disabled={uploading} className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm shadow-sm">
                                {uploading ? 'Uploading...' : 'Choose new image'}
                            </button>
                            <p className="text-sm text-gray-500 mt-3">Recommended: Square PNG/JPG, max 2MB.</p>
                        </div>
                    </div>

                    <div className="mt-8 border border-gray-200 rounded-xl p-6 bg-gray-50/50 relative pointer-events-none">
                        <p className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-4">Preview rendering on Public Link</p>
                        <div className="flex justify-between items-center text-sm border border-gray-100 bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                                {doctor?.logo_url && <img src={doctor.logo_url} className="w-8 h-8 object-contain rounded" alt="Logo" />}
                                <span className="font-semibold text-gray-800">{doctor?.clinic_name || 'PhysioQR Clinic'}</span>
                            </div>
                            <span className="text-gray-500 hidden sm:block">Prescribed by Dr. {doctor?.full_name?.split(' ')[0] || 'PhysioQR'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
