import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-[#0f172a]">
            <div>
                <Link href="/" className="flex items-center gap-2 group">
                    <ApplicationLogo className="h-10 w-auto group-hover:scale-105 transition-all" />
                    <span className="text-slate-900 font-black text-xl tracking-tighter hidden md:block">
                        Nusa<span className="text-indigo-600">Baca</span>
                    </span>
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-8 px-8 py-10 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden sm:rounded-3xl">
                {children}
            </div>
        </div>
    );
}