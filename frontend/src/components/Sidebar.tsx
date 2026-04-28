'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDoctor } from '@/contexts/DoctorContext';

interface SidebarProps {
    onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
    const pathname = usePathname() || '';
    const { doctor } = useDoctor();

    const links = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Patients', href: '/patients' },
        { name: 'Exercises', href: '/exercises' },
        { name: 'Settings', href: '/settings' },
    ];

    return (
        <div className="w-64 h-full bg-white flex flex-col justify-between shrink-0 overflow-y-auto">
            <div>
                <div className="p-6">
                    <h1 className="text-2xl font-bold tracking-tight text-teal-600">PhysioQR</h1>
                </div>
                <nav className="mt-2 flex flex-col gap-1 px-3">
                    {links.map(link => {
                        const isActive = link.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={onNavigate}
                                className={`py-2 px-4 rounded-md transition-all font-medium text-sm ${isActive ? 'bg-teal-50 text-teal-600 border border-teal-100 shadow-sm' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-6 border-t pb-8 mt-auto">
                <p className="text-sm font-bold text-gray-900 truncate">Dr. {doctor?.full_name?.split(' ')[0] || 'Therapist'}</p>
                <button
                    onClick={() => {
                        localStorage.removeItem('supabase_token');
                        window.location.href = '/login';
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 mt-1 font-medium"
                >
                    Sign out
                </button>
            </div>
        </div>
    );
}
