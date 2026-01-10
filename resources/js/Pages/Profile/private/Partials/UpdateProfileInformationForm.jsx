import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        instagram: user.instagram || '',
        tiktok: user.tiktok || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || '',
        website: user.website || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Informasi Pribadi
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Perbarui informasi profil dan akun media sosial kamu di sini.
                </p>
            </header>

            <form onSubmit={submit} className="mt-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <InputLabel htmlFor="name" value="Nama Lengkap" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full bg-transparent border-slate-200 dark:border-white/10 focus:ring-indigo-500 rounded-2xl text-slate-900 dark:text-white"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="email" value="Alamat Email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full bg-transparent border-slate-200 dark:border-white/10 focus:ring-indigo-500 rounded-2xl text-slate-900 dark:text-white"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                {user.role === 'penulis' && (
                    <div className="space-y-2">
                        <InputLabel htmlFor="bio" value="Bio Singkat" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400" />
                        <textarea
                            id="bio"
                            className="mt-1 block w-full bg-transparent border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-indigo-500 rounded-2xl text-sm text-slate-900 dark:text-white"
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            rows="3"
                        />
                        <InputError className="mt-2" message={errors.bio} />
                    </div>
                )}

                <div className="flex items-center gap-4 pt-4">
                    <PrimaryButton 
                        disabled={processing}
                        className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 border-none normal-case font-black tracking-tight text-white"
                    >
                        Simpan Perubahan
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Berhasil disimpan!</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}