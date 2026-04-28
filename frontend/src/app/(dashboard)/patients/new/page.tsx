'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';

export default function NewPatient() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: '',
        age: '',
        gender: 'Male',
        phone: '',
        diagnosis: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...formData,
                age: formData.age ? parseInt(formData.age, 10) : null
            };
            const res = await fetchAPI('/patients', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            router.push(`/patients/${res.id}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-xl mx-auto py-10">
            <h1 className="text-3xl font-semibold text-gray-900 mb-8 tracking-tight">Add New Patient</h1>

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
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-teal-600 text-white rounded hover:bg-teal-700 font-medium transition-colors cursor-pointer disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save patient'}
                    </button>
                    <Link href="/patients" className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded hover:bg-gray-50 transition-colors">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
