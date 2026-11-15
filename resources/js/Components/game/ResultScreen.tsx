import { Grade } from '@/lib/customize/words';
import { Link } from '@inertiajs/react';
import GamePageHeader from './GamePageHeader';

export default function ResultScreen({
    grade,
    score,
    onRetry,
}: {
    grade: Grade;
    score: number;
    onRetry: () => void;
}) {
    return (
        <div>
            <GamePageHeader grade={grade} />

            <div className="mx-auto max-w-xl px-6 py-16 text-center">
                <p className="text-2xl uppercase tracking-widest text-gray-700">
                    Result
                </p>
                <p className="mt-2 text-7xl font-bold">{score}</p>
                <p className="mt-2 text-2xl text-gray-700">正解</p>

                <div className="mt-10 flex items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-md border-2 border-gray-900 bg-white px-6 py-3 font-semibold uppercase tracking-widest text-gray-900 transition hover:bg-gray-100"
                    >
                        Home
                    </Link>
                    <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 font-semibold uppercase tracking-widest text-white transition hover:bg-gray-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        </div>
    );
}
