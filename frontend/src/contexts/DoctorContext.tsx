'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

export interface Doctor {
    id: string;
    email: string;
    full_name: string;
    clinic_name?: string;
    clinic_address?: string;
    city?: string;
    license_no?: string;
    specialisation?: string;
    logo_url?: string;
}

interface DoctorContextType {
    doctor: Doctor | null;
    refreshDoctor: () => Promise<void>;
    loading: boolean;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export function DoctorProvider({ children }: { children: ReactNode }) {
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refreshDoctor = async () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('supabase_token');
            if (!token) {
                router.push('/login');
                return;
            }
        }
        try {
            const data = await fetchAPI('/auth/me');
            setDoctor(data);
        } catch (err) {
            if (typeof window !== 'undefined') localStorage.removeItem('supabase_token');
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshDoctor();
    }, []);

    return (
        <DoctorContext.Provider value={{ doctor, refreshDoctor, loading }}>
            {!loading && children}
        </DoctorContext.Provider>
    );
}

export function useDoctor() {
    const context = useContext(DoctorContext);
    if (!context) throw new Error("useDoctor must be used within DoctorProvider");
    return context;
}
