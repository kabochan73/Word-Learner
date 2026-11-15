import { Grade } from '@/lib/customize/words';
import { Mode } from '@/lib/judge';
import { Link } from '@inertiajs/react';

export default function StartGameButton({
    grade,
    mode,
}: {
    grade: Grade;
    mode: Mode;
}) {
    return (
        <Link
            href={`/play?grade=${grade}&mode=${mode}`}
            className="inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-6 py-3 font-semibold uppercase tracking-widest text-white transition hover:bg-gray-700"
        >
            Start game →
        </Link>
    );
}
