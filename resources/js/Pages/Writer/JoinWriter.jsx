import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useState } from 'react';

export default function JoinWriter({ auth, application }) {
    const [showFormAfterReject, setShowFormAfterReject] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        pen_name: application?.pen_name || '',
        bio: application?.bio || '',
        portfolio: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('writer.store'), {
            onSuccess: () => setShowFormAfterReject(false),
        });
    };

    // Fungsi untuk handle klik Oke saat disetujui
    const handleApprovedOk = () => {
        // Melakukan reload halaman agar menu navigasi berubah sesuai role baru
        window.location.reload();
    };

    const shouldShowForm = !application || showFormAfterReject;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gabung Jadi Penulis" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        <h2 className="text-2xl font-bold mb-2">Wujudkan Karyamu di NusaBaca</h2>
                        <p className="text-gray-600 mb-6">Bagikan ceritamu kepada ribuan pembaca dan bangun komunitas penggemarmu sendiri.</p>

                        {!shouldShowForm ? (
                            <div className={`p-4 rounded-lg border-l-4 ${
                                application.status === 'pending' 
                                ? 'bg-blue-50 border-blue-500' 
                                : application.status === 'approved'
                                ? 'bg-green-50 border-green-500'
                                : 'bg-red-50 border-red-500'
                            }`}>
                                <p className={
                                    application.status === 'pending' ? 'text-blue-700' : 
                                    application.status === 'approved' ? 'text-green-700' : 'text-red-700'
                                }>
                                    Status Pengajuan: <span className="font-bold uppercase">{application.status}</span>
                                </p>
                                
                                {application.status === 'pending' ? (
                                    <p className="text-sm text-blue-600 mt-1">
                                        Terimakasih telah mengirimkan pengajuan, mohon tunggu kamu sedang penulis anda.
                                        Silahkan cek email anda secara berkala
                                    </p>
                                ) : application.status === 'approved' ? (
                                    <div className="mt-2">
                                        <p className="text-sm text-green-600 font-bold">
                                            Selamat! Pengajuan Anda telah disetujui.
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Sekarang Anda bisa mulai berkarya sebagai penulis di NusaBaca.
                                        </p>
                                        <button 
                                            onClick={handleApprovedOk}
                                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition text-sm font-bold"
                                        >
                                            Oke, Mulai Menulis
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-2">
                                        <p className="text-sm text-red-600">
                                            Maaf, pengajuan Anda ditolak.
                                        </p>
                                        {application.message && (
                                            <div className="mt-2 p-2 bg-white border border-red-200 rounded text-sm text-gray-700 italic">
                                                Alasan: "{application.message}"
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => setShowFormAfterReject(true)}
                                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition text-sm font-bold"
                                        >
                                            Oke, Saya Mengerti
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={submit} className="space-y-6">
                                {application?.status === 'rejected' && (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                        <p className="text-sm text-yellow-700 font-bold">Mode Kirim Ulang</p>
                                        <p className="text-xs text-yellow-600">Silakan perbaiki data Anda berdasarkan alasan penolakan sebelumnya.</p>
                                    </div>
                                )}
                                <div>
                                    <InputLabel htmlFor="pen_name" value="Nama Pena" />
                                    <TextInput 
                                        id="pen_name" 
                                        className="mt-1 block w-full" 
                                        value={data.pen_name} 
                                        onChange={(e) => setData('pen_name', e.target.value)} 
                                        required 
                                    />
                                    <InputError message={errors.pen_name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="bio" value="Bio Singkat" />
                                    <textarea
                                        id="bio"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        rows="4"
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                        placeholder="Ceritakan sedikit tentang dirimu..."
                                        required
                                    ></textarea>
                                    <InputError message={errors.bio} className="mt-2" />
                                </div>

                                <div>
                                  <InputLabel value="Unggah Contoh Hasil Karya (PDF)" />
                                  <input 
                                    type="file" 
                                    onChange={(e) => setData('portfolio', e.target.files[0])} 
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                                    accept=".pdf"
                                    required={!application} 
                                  />
                                  <InputError message={errors.portfolio} className="mt-2" />
                                </div>

                                <PrimaryButton disabled={processing}>
                                    {application ? 'Kirim Ulang Pengajuan' : 'Kirim Pengajuan'}
                                </PrimaryButton>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}