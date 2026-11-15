import { GRADE1_WORDS } from './grade1';
import { GRADE2_WORDS } from './grade2';
import { GRADE3_WORDS } from './grade3';

// CUSTOMIZE: meaning(表示するお題)とword(タイピングする入力内容)のペア。
// 英単語学習以外の用途(別言語・別テーマ)に使う場合もこの2フィールドの意味を入れ替えるだけで動く
export type Word = { meaning: string; word: string };

// CUSTOMIZE: キーは易しい順の通し番号("1"/"2"/"3")。別の区分(難易度ラベル等)にしたい場合はキーを変える
export type Grade = '1' | '2' | '3';

export const WORDS_BY_GRADE: Record<Grade, Word[]> = {
    '1': GRADE1_WORDS,
    '2': GRADE2_WORDS,
    '3': GRADE3_WORDS,
};

// CUSTOMIZE: 画面に表示する級の名前
export const GRADE_LABELS: Record<Grade, string> = {
    '1': '英検5級',
    '2': '英検4級',
    '3': '英検3級',
};

export function isValidGrade(value: string): value is Grade {
    return value in WORDS_BY_GRADE;
}
