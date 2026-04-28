import { DoctorProvider } from '@/contexts/DoctorContext';
import { ToastProvider } from '@/components/ToastProvider';
import LayoutComponent from '@/components/Layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            <DoctorProvider>
                <LayoutComponent>
                    {children}
                </LayoutComponent>
            </DoctorProvider>
        </ToastProvider>
    );
}
