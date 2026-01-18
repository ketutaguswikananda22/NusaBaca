import React from 'react';

export default function UserAvatar({ user, className = "w-10 h-10", isEditing = false, removeAvatar = false, previewUrl = null }) {
    const DEFAULT_AVATAR_ICON = "/image/default-avatar-icon.png";

    const getAvatarUrl = () => {
        // 1. Jika sedang dalam mode edit dan ada foto baru yang dipilih
        if (previewUrl) return previewUrl;

        // 2. Jika user menekan tombol 'Hapus Foto' saat edit
        if (removeAvatar) return DEFAULT_AVATAR_ICON;

        // 3. Jika user punya foto di database
        if (user?.avatar) {
            return user.avatar.startsWith('http') 
                ? user.avatar 
                : `/storage/${user.avatar}`;
        }

        // 4. Default: Akun baru/kosong tampilkan Dicebear Random
        // Menggunakan seed 'name' agar tiap user punya karakter unik
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'guest')}`;
    };

    return (
        <img
            src={getAvatarUrl()}
            alt={user?.name || 'User Avatar'}
            className={`rounded-full object-cover shadow-sm ${className}`}
            onError={(e) => { e.target.src = DEFAULT_AVATAR_ICON; }} // Fallback jika link mati
        />
    );
}