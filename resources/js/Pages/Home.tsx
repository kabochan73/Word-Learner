import Header from '@/Components/Header';
import LevelSelect from '@/Components/home/LevelSelect';
import ModeSelect from '@/Components/home/ModeSelect';
import StartGameButton from '@/Components/home/StartGameButton';
import RankingSidebar, {
    RankingEntry,
} from '@/Components/ranking/RankingSidebar';
import { Grade } from '@/lib/customize/words';
import { Mode } from '@/lib/judge';
import { PageProps } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Home({
    grade,
    ranking,
}: {
    grade: Grade;
    ranking: RankingEntry[];
}) {
    const { auth } = usePage<PageProps>().props;
    const [mode, setMode] = useState<Mode>('practice');

    const handleGradeChange = (nextGrade: Grade) => {
        router.reload({
            only: ['grade', 'ranking'],
            data: { grade: nextGrade },
        });
    };

    return (
        <>
            <Head title="Home" />

            <Header user={auth.user} />

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 p-6 lg:grid-cols-4">
                <div className="lg:col-span-3">
                    <h1 className="mt-2 text-4xl font-bold">
                        A typing game made just for you.
                    </h1>
                    <p className="mt-2 text-2xl font-bold">
                        Words make you stronger.
                    </p>

                    <div className="mt-8">
                        <p className="text-lg uppercase tracking-widest text-gray-700">
                            Select level
                        </p>
                        <LevelSelect
                            value={grade}
                            onChange={handleGradeChange}
                        />
                    </div>

                    <div className="mt-6">
                        <p className="text-lg uppercase tracking-widest text-gray-700">
                            Select mode
                        </p>
                        <ModeSelect value={mode} onChange={setMode} />
                    </div>

                    <div className="mt-8">
                        <StartGameButton grade={grade} mode={mode} />
                    </div>
                </div>

                <RankingSidebar ranking={ranking} className="lg:col-span-1" />
            </div>
        </>
    );
}
