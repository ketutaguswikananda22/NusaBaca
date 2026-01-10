import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Head } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Create({ auth, genres }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        genre: [], 
        cover: null,
    });

    const handleGenreChange = (gName) => {
        if (data.genre.includes(gName)) {
            setData('genre', data.genre.filter(item => item !== gName));
        } else {
            if (data.genre.length < 4) {
                setData('genre', [...data.genre, gName]);
            }
        }
    };

    const submit = (e) => {
        e.preventDefault();

        // 1. Konfirmasi tetap dilakukan di sini
        Swal.fire({
            title: 'Kirim untuk Moderasi?',
            text: "Karya anda akan diperiksa sesuai dengan standar komunitas kami sebelum diterbitkan.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Ya, Kirim!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                // 2. Lakukan POST
                post(route('books.store'), {
                    forceFormData: true,
                    // Kita tidak perlu onSuccess Swal di sini lagi, 
                    // karena AuthenticatedLayout akan menangkap flash message-nya secara otomatis
                    onError: () => {
                        Swal.fire({
                            title: 'Gagal!',
                            text: 'Terjadi kesalahan. Pastikan semua data terisi dengan benar.',
                            icon: 'error',
                            confirmButtonColor: '#e11d48',
                        });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="font-bold text-xl text-slate-800">Upload Karya Baru</h2>}
        >
            <Head title="Upload Buku" />
            <div className="max-w-3xl mx-auto p-8 bg-white mt-10 shadow-2xl shadow-slate-200 rounded-3xl border border-slate-100">
                <form onSubmit={submit} className="space-y-6">
                    {/* Judul */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Judul Buku</label>
                        <input 
                            type="text" 
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" 
                            placeholder="Masukkan judul..."
                            value={data.title}
                            onChange={e => setData('title', e.target.value)} 
                        />
                        {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Sinopsis</label>
                        <textarea 
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 min-h-[120px]" 
                            placeholder="Ceritakan isi bukumu..."
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                        ></textarea>
                        {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                    </div>

                    {/* Genre */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Pilih Genre (Maks 4)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {genres && genres.map((g) => {
                                const isSelected = data.genre.includes(g.name);
                                return (
                                    <div key={g.id} onClick={() => handleGenreChange(g.name)}
                                        className={`cursor-pointer p-3 rounded-2xl border-2 text-center transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                                        <span className="text-xs font-bold uppercase">{g.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {errors.genre && <div className="text-rose-500 text-xs mt-2 font-bold">{errors.genre}</div>}
                    </div>

                    {/* Cover */}
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl">
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2">Cover Buku</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => setData('cover', e.target.files[0])} 
                            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-emerald-50 file:text-emerald-700" 
                        />
                        {errors.cover && <div className="text-red-500 text-xs mt-1">{errors.cover}</div>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={processing} 
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {processing ? 'Sedang Mengunggah...' : 'Kirim untuk Moderasi'}
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}