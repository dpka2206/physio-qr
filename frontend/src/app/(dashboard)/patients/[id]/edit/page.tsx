'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';

export default function EditPatient({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: '',
        age: '',
        gender: 'Male',
        phone: '',
        diagnosis: '',
        notes: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchAPI(`/patients/${params.id}`);
                setFormData({
                    full_name: data.full_name || '',
                    age: data.age || '',
                    gender: data.gender || 'Male',
                    phone: data.phone || '',
                    diagnosis: data.diagnosis || '',
                    notes: data.notes || ''
                });
            } catch (err: any) {
                setError("Failed to load patient: " + err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...formData,
                age: formData.age ? parseInt(formData.age as string, 10) : null
            };
            await fetchAPI(`/patients/${params.id}`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
            router.push(`/patients/${params.id}`);
        } catch (err: any) {
            setError(err.message);
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) {
        return (
            <div className="max-w-xl mx-auto py-10 animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
                <div className="space-y-6">
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-10">
            <h1 className="text-3xl font-semibold text-gray-900 mb-8 tracking-tight">Edit Patient</h1>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm border border-red-100 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm bg-white">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Diagnosis / Condition</label>
                    <input type="text" name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Internal Notes</label>
                    <textarea name="notes" rows={4} value={formData.notes} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"></textarea>
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <button type="submit" disabled={saving} className="px-6 py-2.5 bg-teal-600 text-white rounded hover:bg-teal-700 font-medium transition-colors cursor-pointer disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                    <Link href={`/patients/${params.id}`} className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded hover:bg-gray-50 transition-colors">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
