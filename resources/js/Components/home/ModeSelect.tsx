import { Mode } from '@/lib/judge';

const MODES: { value: Mode; title: string; description: string }[] = [
    {
        value: 'practice',
        title: '学習モード',
        description: '答えを見ながら練習',
    },
    {
        value: 'challenge',
        title: 'チャレンジモード',
        description: '答えを隠して挑戦',
    },
];

export default function ModeSelect({
    value,
    onChange,
}: {
    value: Mode;
    onChange: (mode: Mode) => void;
}) {
    return (
        <div className="mt-2 space-y-3">
            {MODES.map((mode) => (
                <button
                    key={mode.value}
                    type="button"
                    onClick={() => onChange(mode.value)}
                    className={`block w-full rounded-md border-2 px-4 py-3 text-left transition ${
                        value === mode.value
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-300 hover:border-gray-900'
                    }`}
                >
                    <span className="block font-semibold">{mode.title}</span>
                    <span className="block text-sm text-gray-600">
                        {mode.description}
                    </span>
                </button>
            ))}
        </div>
    );
}
