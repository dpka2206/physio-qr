'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import { useRouter } from 'next/navigation';

export default function PrescriptionDetail({ params }: { params: { id: string } }) {
    const [prescription, setPrescription] = useState<any>(null);
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchAPI(`/prescriptions/${params.id}`);
                setPrescription(data);

                // Let's also fetch patient to get their name for the link
                if (data.patient_id) {
                    const patData = await fetchAPI(`/patients/${data.patient_id}`);
                    setPatient(patData);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    const handleRegenerateQR = async () => {
        setRegenerating(true);
        try {
            const res = await fetchAPI(`/prescriptions/${params.id}/qr`);
            setPrescription((prev: any) => ({ ...prev, qr_url: res.qr_url }));
            // Open the QR page or download directly
            router.push(`/prescriptions/${params.id}/qr`);
        } catch (e) {
            alert("Failed to regenerate QR");
        } finally {
            setRegenerating(false);
        }
    };

    const handleArchive = async () => {
        if (!confirm("Are you sure you want to archive this prescription?")) return;
        try {
            await fetchAPI(`/prescriptions/${params.id}`, {
                method: 'DELETE'
            });
            setPrescription({ ...prescription, status: 'archived' });
        } catch (e) {
            alert("Failed to archive");
        }
    };

    if (loading) {
        return <div className="max-w-4xl mx-auto py-10 animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
        </div>;
    }

    if (error || !prescription) {
        return <div className="max-w-4xl mx-auto py-10 text-red-500">{error || 'Prescription not found'}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{prescription.title}</h1>
                        <StatusBadge status={prescription.status} />
                    </div>

                    <p className="text-gray-500 flex items-center gap-2">
                        For <Link href={`/patients/${prescription.patient_id}`} className="text-teal-600 hover:underline font-medium">{patient?.full_name || 'Patient'}</Link>
                    </p>

                    <p className="text-sm text-gray-400 mt-2">
                        Created: {new Date(prescription.created_at).toLocaleDateString()}
                        {prescription.valid_until && ` • Valid until: ${new Date(prescription.valid_until).toLocaleDateString()}`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {prescription.status !== 'archived' && (
                        <button onClick={handleArchive} className="px-4 py-2 border border-red-200 text-red-600 rounded bg-white hover:bg-red-50 transition-colors font-medium text-sm">
                            Archive
                        </button>
                    )}
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded bg-white hover:bg-gray-50 transition-colors font-medium text-sm">
                        Edit
                    </button>
                    <Link href={`/prescriptions/${prescription.id}/qr`} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors font-medium text-sm shadow-sm">
                        View QR
                    </Link>
                </div>
            </div>

            {prescription.notes && (
                <div className="mb-8 p-5 bg-gray-50 border-l-4 border-teal-600 rounded-r-lg">
                    <h4 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-2">Doctor's General Notes</h4>
                    <p className="text-gray-800 whitespace-pre-wrap text-sm">{prescription.notes}</p>
                </div>
            )}

            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Exercises ({prescription.exercises?.length || 0})</h3>

                <div className="space-y-4">
                    {prescription.exercises?.map((px: any, idx: number) => {
                        const ex = px.exercises || {};
                        return (
                            <div key={px.id} className="bg-white border rounded-lg p-5 flex gap-5 hover:border-gray-300 transition-colors shadow-sm">
                                <div className="text-2xl font-bold text-gray-200 shrink-0 w-8 text-center">{idx + 1}</div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="text-lg font-semibold text-gray-900">{ex.name}</h4>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{ex.body_part}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-3 mt-3 mb-4">
                                        {px.sets && <div className="px-3 py-1 bg-teal-50 border border-teal-100 text-teal-800 rounded font-medium text-sm">{px.sets} Sets</div>}
                                        {px.reps && <div className="px-3 py-1 bg-teal-50 border border-teal-100 text-teal-800 rounded font-medium text-sm">{px.reps} Reps</div>}
                                        {px.duration_seconds && <div className="px-3 py-1 bg-teal-50 border border-teal-100 text-teal-800 rounded font-medium text-sm">{px.duration_seconds} Seconds</div>}
                                    </div>

                                    {px.doctor_note && (
                                        <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                            <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            <p className="italic">{px.doctor_note}</p>
                                        </div>
                                    )}
                                </div>

                                {(px.yt_url || ex.yt_thumbnail) && (
                                    <a
                                        href={px.yt_url || ex.default_yt_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="shrink-0 w-[100px] sm:w-[140px] block relative group rounded-md overflow-hidden border border-gray-200"
                                    >
                                        <img src={ex.yt_thumbnail || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200"} alt="Video thumbnail" className="w-full h-[70px] sm:h-[90px] object-cover group-hover:scale-105 transition-transform duration-300" />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                                            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center opacity-90 shadow">
                                                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                                            </div>
                                        </div>
                                    </a>
                                )}
                            </div>
                        );
                    })}

                    {(!prescription.exercises || prescription.exercises.length === 0) && (
                        <p className="text-gray-500 italic">No exercises added.</p>
                    )}
                </div>
            </div>

            <div className="border-t pt-8 text-center pb-10">
                <button onClick={handleRegenerateQR} disabled={regenerating} className="text-gray-500 hover:text-teal-600 text-sm font-medium transition-colors underline underline-offset-4 disabled:opacity-50">
                    {regenerating ? 'Regenerating...' : 'Regenerate QR Code'}
                </button>
            </div>

        </div>
    );
}
