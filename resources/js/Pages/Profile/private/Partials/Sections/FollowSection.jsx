import React from 'react';

export default function FollowSection({ list, UserCard }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {list?.map(person => (
                <UserCard key={person.id} userData={person} isActuallyFollowed={person.is_followed_by_auth || true} />
            ))}
            {(!list || list.length === 0) && (
                <div className="col-span-full py-20 text-center opacity-30 italic text-sm">Tidak ditemukan data.</div>
            )}
        </div>
    );
}