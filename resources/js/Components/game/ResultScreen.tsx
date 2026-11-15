import { Grade } from '@/lib/customize/words';
import { Mode } from '@/lib/judge';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import GamePageHeader from './GamePageHeader';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function ResultScreen({
    grade,
    mode,
    score,
    onRetry,
}: {
    grade: Grade;
    mode: Mode;
    score: number;
    onRetry: () => void;
}) {
    const { auth } = usePage<PageProps>().props;
    const [saveState, setSaveState] = useState<SaveState>('idle');

    const save = () => {
        setSaveState('saving');
        axios
            .post('/game-sessions', { grade, score })
            .then(() => setSaveState('saved'))
            .catch(() => setSaveState('error'));
    };

    useEffect(() => {
        if (mode === 'challenge' && auth.user) {
            save();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <GamePageHeader grade={grade} />

            <div className="mx-auto max-w-xl px-6 py-16 text-center">
                <p className="text-2xl uppercase tracking-widest text-gray-700">
                    Result
                </p>
                <p className="mt-2 text-7xl font-bold">{score}</p>
                <p className="mt-2 text-2xl text-gray-700">正解</p>

                {mode === 'challenge' && auth.user && saveState === 'error' && (
                    <button
                        type="button"
                        onClick={save}
                        className="mt-6 text-red-600 underline"
                    >
                        保存に失敗しました。再試行する
                    </button>
                )}

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
