import { GRADE_LABELS, Grade } from '@/lib/customize/words';
import { Link } from '@inertiajs/react';

export default function GamePageHeader({ grade }: { grade: Grade }) {
    return (
        <div className="flex w-full items-center justify-between border-b border-gray-700 px-12 py-4">
            <Link href="/" className="text-2xl font-bold tracking-widest">
                WORD LEARNER
            </Link>
            <p className="text-xl">{GRADE_LABELS[grade]}</p>
        </div>
    );
}
