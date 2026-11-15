export type RankingEntry = { rank: number; name: string; bestScore: number };

export default function RankingSidebar({
    ranking,
    className,
}: {
    ranking: RankingEntry[];
    className?: string;
}) {
    return (
        <div className={className}>
            <h2 className="mt-2 text-3xl font-bold">Top 10 Scores</h2>

            {ranking.length === 0 ? (
                <p className="mt-4 text-lg text-gray-500">No rankings yet.</p>
            ) : (
                <ol className="mt-4 divide-y divide-gray-400">
                    {ranking.map((entry) => (
                        <li
                            key={entry.rank}
                            className="flex items-center justify-between py-2 text-xl"
                        >
                            <span>
                                {entry.rank}. {entry.name}
                            </span>
                            <span>{entry.bestScore}</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
