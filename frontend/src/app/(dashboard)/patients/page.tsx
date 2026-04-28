'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';

export default function PatientsList() {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const query = search ? `?q=${encodeURIComponent(search)}` : '';
                const data = await fetchAPI(`/patients${query}`);
                setPatients(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        const timeoutId = setTimeout(load, 300); // debounce
        return () => clearTimeout(timeoutId);
    }, [search]);

    return (
        <div className="max-w-6xl mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Patients</h1>
                <Link href="/patients/new" className="px-4 py-2 border border-teal-600 text-teal-600 rounded hover:bg-teal-50 transition-colors font-medium cursor-pointer">
                    + New patient
                </Link>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name or diagnosis..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm transition-shadow"
                />
            </div>

            {loading ? (
                <div className="animate-pulse flex flex-col gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded w-full"></div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-red-500 bg-red-50 p-4 border rounded">{error}</div>
            ) : patients.length === 0 ? (
                <div className="text-center py-24 border rounded bg-gray-50 flex flex-col items-center">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <p className="text-gray-500 text-lg">No patients yet. Add your first patient.</p>
                </div>
            ) : (
                <div className="bg-white rounded border border-gray-200 overflow-hidden">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 uppercase tracking-wider text-gray-500 font-medium text-xs">
                            <tr>
                                <th className="px-6 py-3.5">Name</th>
                                <th className="px-6 py-3.5">Age</th>
                                <th className="px-6 py-3.5">Diagnosis</th>
                                <th className="px-6 py-3.5">Added</th>
                                <th className="px-6 py-3.5">Prescriptions count</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {patients.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{p.full_name}</td>
                                    <td className="px-6 py-4 text-gray-600">{p.age || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{p.diagnosis || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{new Date(p.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-gray-600">{p.prescriptions ? p.prescriptions.length : '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/patients/${p.id}`} className="text-teal-600 hover:text-teal-800 font-medium">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
