'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

export default function Dashboard() {
    const [patients, setPatients] = useState<any[]>([]);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [pData, rData] = await Promise.all([
                    fetchAPI('/patients'),
                    fetchAPI('/prescriptions')
                ]);
                setPatients(pData);
                setPrescriptions(rData);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="h-24 bg-gray-100 rounded-xl"></div>
                    <div className="h-24 bg-gray-100 rounded-xl"></div>
                    <div className="h-24 bg-gray-100 rounded-xl"></div>
                    <div className="h-24 bg-gray-100 rounded-xl"></div>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 h-96 bg-gray-100 rounded-xl"></div>
                    <div className="w-full md:w-1/3 h-96 bg-gray-100 rounded-xl"></div>
                </div>
            </div>
        );
    }

    const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthPrescriptions = prescriptions.filter(p => {
        const d = new Date(p.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const recentPrescriptions = [...prescriptions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
    const recentPatients = [...patients].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border text-gray-900 rounded-xl p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total patients</p>
                    <h3 className="text-3xl font-semibold text-gray-900">{patients.length}</h3>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Active prescriptions</p>
                    <h3 className="text-3xl font-semibold text-gray-900">{activePrescriptions}</h3>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Prescriptions this month</p>
                    <h3 className="text-3xl font-semibold text-gray-900">{monthPrescriptions}</h3>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Exercises in library</p>
                    <h3 className="text-3xl font-semibold text-gray-900">20+</h3>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 text-gray-900">
                <div className="lg:w-3/5">
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-semibold text-gray-800 tracking-tight">Recent prescriptions</h3>
                        </div>
                        <div className="divide-y divide-gray-100 flex-1">
                            {recentPrescriptions.map(rx => {
                                const pat = patients.find(p => p.id === rx.patient_id);
                                return (
                                    <Link key={rx.id} href={`/prescriptions/${rx.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{rx.title}</h4>
                                            <p className="text-sm text-gray-500">For {pat?.full_name || 'Patient'} • {new Date(rx.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <StatusBadge status={rx.status} />
                                    </Link>
                                );
                            })}
                            {recentPrescriptions.length === 0 && <div className="p-8 text-center text-gray-500 italic">No prescriptions yet</div>}
                        </div>
                        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                            <Link href="/patients" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">View all prescriptions &rarr;</Link>
                        </div>
                    </div>
                </div>

                <div className="lg:w-2/5 text-gray-900">
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-semibold text-gray-800 tracking-tight">Recent patients</h3>
                            <Link href="/patients/new" className="text-xs font-semibold text-teal-600 border border-teal-200 bg-white hover:bg-teal-50 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                                + New
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-100 flex-1">
                            {recentPatients.map(pat => (
                                <Link key={pat.id} href={`/patients/${pat.id}`} className="block p-4 hover:bg-gray-50 transition-colors group">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{pat.full_name}</h4>
                                        <span className="text-xs text-gray-400 font-medium">{new Date(pat.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{pat.condition || 'No diagnosis recorded'}</p>
                                </Link>
                            ))}
                            {recentPatients.length === 0 && <div className="p-8 text-center text-gray-500 italic">No patients yet</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
