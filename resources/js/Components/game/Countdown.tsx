import { Grade } from '@/lib/customize/words';
import GamePageHeader from './GamePageHeader';

export default function Countdown({
    grade,
    countdown,
}: {
    grade: Grade;
    countdown: number;
}) {
    return (
        <div>
            <GamePageHeader grade={grade} />

            <div className="flex flex-col items-center justify-center py-32 text-center">
                <p className="text-xl uppercase tracking-widest text-gray-500">
                    Get ready
                </p>
                <p className="mt-4 text-7xl font-bold">{countdown}</p>
            </div>
        </div>
    );
}
