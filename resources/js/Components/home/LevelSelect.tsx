import { GRADE_LABELS, Grade } from '@/lib/customize/words';

export default function LevelSelect({
    value,
    onChange,
}: {
    value: Grade;
    onChange: (grade: Grade) => void;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as Grade)}
            className="mt-2 block w-full rounded-md border-2 border-gray-300 shadow-sm hover:border-gray-900 focus:border-gray-900 focus:ring-gray-900"
        >
            {(Object.keys(GRADE_LABELS) as Grade[]).map((grade) => (
                <option key={grade} value={grade}>
                    {GRADE_LABELS[grade]}
                </option>
            ))}
        </select>
    );
}
