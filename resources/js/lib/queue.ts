import { Grade, Word, WORDS_BY_GRADE } from './customize/words';

function shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export function createWordQueue(grade: Grade): Word[] {
    return shuffle(WORDS_BY_GRADE[grade]);
}

/**
 * キューの先頭を1件取り出す。空になっていたら作り直す。
 * 作り直した直後の1件目が直前の単語と同じ場合は入れ替える(連続した同一単語を避ける)。
 */
export function drawNextWord(
    queue: Word[],
    grade: Grade,
    previousMeaning: string | null,
): { word: Word; queue: Word[] } {
    let nextQueue = queue;

    if (nextQueue.length === 0) {
        nextQueue = createWordQueue(grade);
        if (nextQueue.length > 1 && nextQueue[0].meaning === previousMeaning) {
            [nextQueue[0], nextQueue[1]] = [nextQueue[1], nextQueue[0]];
        }
    }

    const [word, ...rest] = nextQueue;
    return { word, queue: rest };
}
