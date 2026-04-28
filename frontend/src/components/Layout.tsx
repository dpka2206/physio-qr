'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';
import { useDoctor } from '@/contexts/DoctorContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '';
    const { doctor } = useDoctor();
    const [mobileOpen, setMobileOpen] = useState(false);

    let title = 'Dashboard';
    if (pathname.includes('/patients/new')) title = 'New Patient';
    else if (pathname.includes('/edit')) title = 'Edit Patient';
    else if (pathname.includes('/prescriptions/new')) title = 'Prescription Builder';
    else if (pathname.includes('/prescriptions/') && pathname.includes('/qr')) title = 'QR Code';
    else if (pathname.includes('/prescriptions/')) title = 'Prescription Details';
    else if (pathname.includes('/patients/')) title = 'Patient Details';
    else if (pathname.includes('/patients')) title = 'Patients';
    else if (pathname.includes('/settings')) title = 'Settings';
    else if (pathname.includes('/exercises')) title = 'Exercises Library';

    const initials = doctor?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DR';

    return (
        <div className="flex h-screen bg-white overflow-hidden text-gray-900">
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform md:relative md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="h-16 border-b flex items-center justify-between px-5 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 -ml-2 text-gray-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 hidden sm:block">Dr. {doctor?.full_name || 'Doctor'}</span>
                        <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm border border-teal-100 shrink-0 uppercase shadow-sm">
                            {initials}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
