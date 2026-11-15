import Header from '@/Components/Header';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen">
            <Header user={auth.user} />
            <div className="mx-auto max-w-md px-6 py-16">{children}</div>
        </div>
    );
}
