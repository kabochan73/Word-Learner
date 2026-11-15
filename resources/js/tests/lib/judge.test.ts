import { describe, expect, it } from 'vitest';
import {
    BONUS_COMBO_THRESHOLD,
    BONUS_SECONDS,
} from '../../lib/customize/game-config';
import { Word } from '../../lib/customize/words';
import { GameState, handleKeyInput } from '../../lib/judge';

function createState(overrides: Partial<GameState> = {}): GameState {
    const word: Word = { meaning: '猫', word: 'cat' };

    return {
        status: 'playing',
        grade: '1',
        mode: 'challenge',
        currentWord: word,
        wordQueue: [{ meaning: '犬', word: 'dog' }],
        typedLength: 0,
        mistakeInCurrentWord: false,
        combo: 0,
        score: 0,
        questionsShown: 1,
        questionElapsedMs: 0,
        remainingMs: 60000,
        ...overrides,
    };
}

describe('handleKeyInput', () => {
    it('正しいキーならtypedLengthが進む', () => {
        const state = createState();
        const next = handleKeyInput(state, 'c');

        expect(next.typedLength).toBe(1);
        expect(next.mistakeInCurrentWord).toBe(false);
    });

    it('間違ったキーならtypedLengthは進まず、ミスフラグが立つ', () => {
        const state = createState();
        const next = handleKeyInput(state, 'x');

        expect(next.typedLength).toBe(0);
        expect(next.mistakeInCurrentWord).toBe(true);
    });

    it('大文字小文字は区別しない', () => {
        const state = createState();
        const next = handleKeyInput(state, 'C');

        expect(next.typedLength).toBe(1);
    });

    it('単語を最後まで打つとスコアが+1され、次の単語に切り替わる', () => {
        const state = createState({ typedLength: 2 }); // "ca" まで入力済み
        const next = handleKeyInput(state, 't');

        expect(next.score).toBe(1);
        expect(next.questionsShown).toBe(2);
        expect(next.typedLength).toBe(0);
        expect(next.currentWord).toEqual({ meaning: '犬', word: 'dog' });
    });

    it('ノーミスで単語を完了するとコンボが+1される', () => {
        const state = createState({ typedLength: 2, combo: 1 });
        const next = handleKeyInput(state, 't');

        expect(next.combo).toBe(2);
    });

    it('ミスがあった単語を完了するとコンボが0にリセットされる', () => {
        const state = createState({
            typedLength: 2,
            combo: 3,
            mistakeInCurrentWord: true,
        });
        const next = handleKeyInput(state, 't');

        expect(next.combo).toBe(0);
    });

    it(`ノーミスで${BONUS_COMBO_THRESHOLD}問連続正解すると残り時間にボーナスが入りコンボがリセットされる`, () => {
        const state = createState({
            typedLength: 2,
            combo: BONUS_COMBO_THRESHOLD - 1,
            remainingMs: 10000,
        });
        const next = handleKeyInput(state, 't');

        expect(next.combo).toBe(0);
        expect(next.remainingMs).toBe(10000 + BONUS_SECONDS * 1000);
    });

    it(`${BONUS_COMBO_THRESHOLD}問に満たない場合はボーナスが入らない`, () => {
        const state = createState({
            typedLength: 2,
            combo: BONUS_COMBO_THRESHOLD - 2,
            remainingMs: 10000,
        });
        const next = handleKeyInput(state, 't');

        expect(next.remainingMs).toBe(10000);
    });
});
