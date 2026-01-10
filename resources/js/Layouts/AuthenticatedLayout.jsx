import Dropdown from '@/Components/Dropdown';
import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props; 
    
    const user = auth?.user; 
    
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: flash.success,
                timer: 3000,
                showConfirmButton: false,
                timerProgressBar: true,
            });
        }

        if (flash?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: flash.error,
            });
        }
    }, [flash]);

    const { data, setData, get } = useForm({
        search: new URLSearchParams(window.location.search).get('search') || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('dashboard'), { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-slate-400 shadow-sm sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2 group">
                                    <ApplicationLogo className="h-10 w-auto group-hover:scale-105 transition-all" />
                                    <span className="text-slate-900 font-black text-xl tracking-tighter hidden md:block">
                                        Nusa<span className="text-[#ff6122]">Baca</span>
                                    </span>
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>

                                {/* Gunakan user?.role untuk keamanan */}
                                {(user?.role === 'author' || user?.role === 'penulis') && (
                                    <NavLink href={route('author.books')} active={route().current('author.books')}>
                                        Karya Saya
                                    </NavLink>
                                )}

                                <NavLink href={route('library.index')} active={route().current('library.index')}>
                                    Library
                                </NavLink>

                                {user && (user?.role === 'pembaca' || user?.role === 'user') && (
                                    <NavLink href={route('writer.join')} active={route().current('writer.join')}>
                                        Mulai Menulis
                                    </NavLink>
                                )}

                                {user?.role === 'admin' && (
                                    <>
                                        <NavLink href={route('admin.index')} active={route().current('admin.index')}>
                                            Admin Center
                                        </NavLink>
                                        <NavLink href={route('admin.writer.applications')} active={route().current('admin.writer.applications')}>
                                            Persetujuan Penulis
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button type="button" className="inline-flex items-center justify-center rounded-full border border-transparent bg-white p-2 text-gray-500 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-700 focus:outline-none">
                                                <div className="relative">
                                                    {user?.avatar ? (
                                                        <img src={user.avatar} className="h-8 w-8 rounded-full object-cover border border-gray-200" alt={user?.name} />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <div className="block px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                            <div className="text-sm font-semibold text-gray-800 truncate">{user?.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')}>Pengaturan Profil</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            <span className="text-red-600">Log out</span>
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        
                        {(user?.role === 'author' || user?.role === 'penulis') && (
                            <ResponsiveNavLink href={route('author.books')} active={route().current('author.books')}>
                                Karya Saya
                            </ResponsiveNavLink>
                        )}

                        <ResponsiveNavLink href={route('library.index')} active={route().current('library.index')}>
                            Library
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="flex items-center px-4">
                            <div className="shrink-0 me-3">
                                {user?.avatar ? (
                                    <img className="h-10 w-10 rounded-full object-cover border border-gray-200" src={user.avatar} alt={user?.name} />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}