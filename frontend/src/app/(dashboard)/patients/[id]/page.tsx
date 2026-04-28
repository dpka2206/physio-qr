'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

export default function PatientDetail({ params }: { params: { id: string } }) {
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchAPI(`/patients/${params.id}`);
                setPatient(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto py-8 animate-pulse space-y-8">
                <div>
                    <div className="h-10 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="h-48 bg-gray-100 rounded w-full border"></div>
                <div className="h-64 bg-gray-100 rounded w-full border"></div>
            </div>
        );
    }

    if (error) {
        return <div className="max-w-5xl mx-auto py-8 text-red-500">{error}</div>;
    }

    if (!patient) return null;

    return (
        <div className="max-w-5xl mx-auto py-8 space-y-10">

            {/* Header section */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">{patient.full_name}</h1>
                    <p className="text-lg text-gray-500 mt-1">{patient.diagnosis || 'No specific diagnosis'}</p>
                </div>
                <Link
                    href={`/patients/${patient.id}/edit`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded hover:bg-gray-50 font-medium transition-colors"
                >
                    Edit patient
                </Link>
            </div>

            {/* Two sections wrapper */}
            <div className="space-y-8">

                {/* Info card */}
                <section className="bg-white border rounded">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900">Patient info</h2>
                        <Link href={`/patients/${patient.id}/edit`} className="text-sm font-medium text-teal-600 hover:text-teal-800">Edit</Link>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Age & Gender</p>
                            <p className="text-gray-900">{patient.age ? `${patient.age} y/o` : '-'} • {patient.gender}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Phone</p>
                            <p className="text-gray-900">{patient.phone || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Internal Notes</p>
                            <p className="text-gray-900 whitespace-pre-wrap">{patient.notes || '-'}</p>
                        </div>
                    </div>
                </section>

                {/* Prescriptions */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Prescriptions</h2>
                        <Link
                            href={`/patients/${patient.id}/prescriptions/new`}
                            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors shadow-sm font-medium"
                        >
                            + Create prescription
                        </Link>
                    </div>

                    {!patient.prescriptions || patient.prescriptions.length === 0 ? (
                        <div className="border border-dashed border-gray-300 rounded-lg py-16 text-center bg-gray-50">
                            <p className="text-gray-500">No prescriptions added yet.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded border overflow-hidden">
                            <table className="min-w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-200 uppercase tracking-wider text-gray-500 font-medium text-xs">
                                    <tr>
                                        <th className="px-6 py-3.5">Title</th>
                                        <th className="px-6 py-3.5">Date</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {patient.prescriptions.map((rx: any) => (
                                        <tr key={rx.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{rx.title}</td>
                                            <td className="px-6 py-4 text-gray-600">{new Date(rx.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <StatusBadge status={rx.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-4">
                                                <button className="text-gray-500 font-medium hover:text-gray-700">Duplicate</button>
                                                <Link href={`/prescriptions/${rx.id}`} className="text-teal-600 hover:text-teal-800 font-medium">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

        </div>
    );
}
