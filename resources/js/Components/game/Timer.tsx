import { formatTime } from '@/lib/format';

export default function Timer({ remainingMs }: { remainingMs: number }) {
    return (
        <div className="text-center">
            <p className="mb-2 text-lg uppercase tracking-widest text-gray-600">
                Time
            </p>
            <p className="text-4xl font-bold tabular-nums">
                {formatTime(remainingMs)}
            </p>
        </div>
    );
}
