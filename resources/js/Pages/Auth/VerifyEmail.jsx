import React, { useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});
    const { auth } = usePage().props;

    // --- LOGIKA POLLING AUTO REDIRECT ---
    useEffect(() => {
        // Cek setiap 3 detik apakah status verifikasi di database sudah berubah
        const interval = setInterval(() => {
            router.reload({
                only: ['auth'], // Hanya ambil data user (auth), supaya ringan
                onSuccess: (page) => {
                    // Jika field email_verified_at sudah tidak null, berarti sudah klik verif di tab lain
                    if (page.props.auth.user.email_verified_at) {
                        router.visit(route('dashboard'));
                    }
                }
            });
        }, 3000);

        // Bersihkan interval jika user meninggalkan halaman atau logout
        return () => clearInterval(interval);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-4 text-sm text-gray-600">
                Thanks for signing up! Before getting started, could you verify
                your email address by clicking on the link we just emailed to
                you? If you didn't receive the email, we will gladly send you
                another.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton disabled={processing}>
                        Resend Verification Email
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}