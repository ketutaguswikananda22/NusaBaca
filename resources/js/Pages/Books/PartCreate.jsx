import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function PartCreate({ auth, book }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        order: 1,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('parts.store', book.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Tambah Bab - ${book.title}`} />
            <div className="py-12 max-w-4xl mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">Tambah Bab Baru untuk: {book.title}</h2>
                <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-lg shadow">
                    <div>
                        <label className="block font-medium">Judul Bab</label>
                        <input type="text" className="w-full border-gray-300 rounded" 
                               value={data.title} onChange={e => setData('title', e.target.value)} />
                    </div>
                    <div>
                        <label className="block font-medium">Urutan (Bab ke-berapa?)</label>
                        <input type="number" className="w-full border-gray-300 rounded" 
                               value={data.order} onChange={e => setData('order', e.target.value)} />
                    </div>
                    <div>
                        <label className="block font-medium">Isi Cerita</label>
                        <textarea className="w-full border-gray-300 rounded h-64" 
                                  value={data.content} onChange={e => setData('content', e.target.value)} />
                    </div>
                    <button type="submit" disabled={processing} className="bg-blue-600 text-white px-4 py-2 rounded">
                        Simpan Bab
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}