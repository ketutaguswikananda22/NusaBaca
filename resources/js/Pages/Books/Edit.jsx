import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Head } from '@inertiajs/react';

// Tambahkan 'genres' ke dalam props agar sinkron dengan data dari database
export default function Edit({ auth, book, genres }) {
    const { data, setData, post, processing, errors } = useForm({
        title: book.title,
        description: book.description,
        // Inisialisasi genre dari data buku yang sudah ada
        genre: Array.isArray(book.genre) ? book.genre : (book.genre ? [book.genre] : []),
        cover: null,
        _method: 'PUT', // Spoofing method untuk update data dengan file
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
        // Menggunakan POST dengan _method PUT karena Inertia/Laravel menangani upload file lebih stabil via POST
        post(route('books.update', book.id), { 
            forceFormData: true,
            preserveScroll: true 
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="font-bold text-xl text-slate-800">Edit: {book.title}</h2>}
        >
            <Head title="Edit Buku" />
            <div className="max-w-3xl mx-auto p-8 bg-white mt-10 shadow-2xl shadow-slate-200 rounded-3xl border border-slate-100 mb-10">
                <form onSubmit={submit} className="space-y-6">
                    {/* Judul Buku */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Judul Buku</label>
                        <input 
                            type="text" 
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition font-bold text-slate-700 shadow-sm" 
                            value={data.title}
                            onChange={e => setData('title', e.target.value)} 
                        />
                        {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Sinopsis / Deskripsi</label>
                        <textarea 
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition min-h-[120px] text-slate-600 shadow-sm" 
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                        ></textarea>
                        {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                    </div>

                    {/* Genre - Menggunakan mapping yang sama dengan Create */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Pilih Genre (Maksimal 4)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {genres && genres.map((g) => {
                                const isSelected = data.genre.includes(g.name);
                                return (
                                    <div 
                                        key={g.id}
                                        onClick={() => handleGenreChange(g.name)}
                                        className={`
                                            cursor-pointer p-3 rounded-2xl border-2 transition-all duration-200 text-center
                                            ${isSelected 
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md scale-95' 
                                                : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 shadow-sm'
                                            }
                                        `}
                                    >
                                        <span className="text-xs font-bold uppercase tracking-tight">{g.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {errors.genre && <div className="text-rose-500 text-xs mt-2 font-bold">{errors.genre}</div>}
                    </div>

                    {/* Hanya Upload Cover Buku (PDF dihapus agar sama dengan Create) */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 transition bg-slate-50">
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Ganti Cover (Opsional)</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={e => setData('cover', e.target.files[0])} 
                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                            />
                        </div>
                        {errors.cover && <div className="text-red-500 text-xs mt-1">{errors.cover}</div>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={processing} 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {processing ? 'Sedang Memperbarui...' : 'Simpan Perubahan'}
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}