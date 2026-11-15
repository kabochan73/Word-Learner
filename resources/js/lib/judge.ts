import { BONUS_COMBO_THRESHOLD, BONUS_SECONDS } from './customize/game-config';
import { Grade, Word } from './customize/words';
import { drawNextWord } from './queue';

// CUSTOMIZE: 学習モード(答えを見ながら練習)とチャレンジモード(答えを隠して挑戦)
export type Mode = 'practice' | 'challenge';

export type GameState = {
    status: 'idle' | 'playing' | 'finished';
    grade: Grade; // 開始前に選択した級
    mode: Mode; // 開始前に選択したモード
    currentWord: Word;
    wordQueue: Word[]; // バッグ方式の残りキュー(createWordQueue/drawNextWord)
    typedLength: number; // 現在の単語で何文字入力済みか
    mistakeInCurrentWord: boolean;
    combo: number; // ノーミスで連続正解した単語数
    score: number; // 正解して完了した単語数(ランキング対象のスコア)
    questionsShown: number; // 画面に出した単語の総数(完了・スキップ問わず。問題番号の表示に使う)
    questionElapsedMs: number; // 現在の単語が表示されてからの経過時間(チャレンジモードの時間切れスキップ判定用)
    remainingMs: number;
};

/**
 * 1文字分のキー入力を処理する。
 * ミスはコンボをリセットするだけで入力はブロックしない(正しいキーが押されるまでtypedLengthは進まない)。
 */
export function handleKeyInput(state: GameState, key: string): GameState {
    const expected = state.currentWord.word[state.typedLength]?.toLowerCase();

    if (key.toLowerCase() !== expected) {
        return { ...state, mistakeInCurrentWord: true };
    }

    const typedLength = state.typedLength + 1;
    const wordCompleted = typedLength === state.currentWord.word.length;

    if (!wordCompleted) {
        return { ...state, typedLength };
    }

    // 単語完了。スコアは単語完了ごとに+1(ミスの有無に関わらず)。コンボ条件とは独立
    const combo = state.mistakeInCurrentWord ? 0 : state.combo + 1;
    const bonusTriggered = combo > 0 && combo % BONUS_COMBO_THRESHOLD === 0;
    const { word: nextWord, queue: nextQueue } = drawNextWord(
        state.wordQueue,
        state.grade,
        state.currentWord.meaning,
    );

    return {
        ...state,
        score: state.score + 1,
        questionsShown: state.questionsShown + 1,
        questionElapsedMs: 0,
        combo: bonusTriggered ? 0 : combo,
        remainingMs: bonusTriggered
            ? state.remainingMs + BONUS_SECONDS * 1000
            : state.remainingMs,
        currentWord: nextWord,
        wordQueue: nextQueue,
        typedLength: 0,
        mistakeInCurrentWord: false,
    };
}
