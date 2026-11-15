import { User } from '@/types';
import { Link } from '@inertiajs/react';

const NAV_LINK_CLASS = 'text-lg text-gray-700 underline hover:font-bold';

export default function Header({ user }: { user: User | null }) {
    return (
        <div className="flex w-full items-center justify-between border-b border-gray-700 px-12 py-4">
            <Link href="/" className="text-2xl font-bold tracking-widest">
                WORD LEARNER
            </Link>

            {user ? (
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className={NAV_LINK_CLASS}
                >
                    LOGOUT
                </Link>
            ) : (
                <div className="flex items-center gap-4">
                    <Link href="/login" className={NAV_LINK_CLASS}>
                        LOGIN
                    </Link>
                    <Link href="/register" className={NAV_LINK_CLASS}>
                        REGISTER
                    </Link>
                </div>
            )}
        </div>
    );
}
