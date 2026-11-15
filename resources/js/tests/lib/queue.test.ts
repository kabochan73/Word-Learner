import { describe, expect, it } from 'vitest';
import { WORDS_BY_GRADE } from '../../lib/customize/words';
import { createWordQueue, drawNextWord } from '../../lib/queue';

describe('createWordQueue', () => {
    it('指定した級の単語をすべて含む(シャッフルされるが過不足はない)', () => {
        const queue = createWordQueue('1');

        expect(queue).toHaveLength(WORDS_BY_GRADE['1'].length);
        expect(new Set(queue)).toEqual(new Set(WORDS_BY_GRADE['1']));
    });
});

describe('drawNextWord', () => {
    it('キューに残りがあればそのまま先頭を取り出す', () => {
        const queue = [
            { meaning: 'A', word: 'a' },
            { meaning: 'B', word: 'b' },
        ];

        const { word, queue: rest } = drawNextWord(queue, '1', null);

        expect(word).toEqual({ meaning: 'A', word: 'a' });
        expect(rest).toEqual([{ meaning: 'B', word: 'b' }]);
    });

    it('キューが空になったら級の単語で作り直す', () => {
        const { word, queue: rest } = drawNextWord([], '1', null);

        expect(WORDS_BY_GRADE['1']).toContainEqual(word);
        expect(rest).toHaveLength(WORDS_BY_GRADE['1'].length - 1);
    });

    it('作り直した直後の1件目が直前の単語と同じにならない', () => {
        // 単語数が2以上ある前提(実データ)で、何度か試して全て回避できることを確認する
        for (let i = 0; i < 20; i++) {
            const previous = WORDS_BY_GRADE['1'][0].meaning;
            const { word } = drawNextWord([], '1', previous);
            expect(word.meaning).not.toBe(previous);
        }
    });
});
