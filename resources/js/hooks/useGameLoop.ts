import {
    COUNTDOWN_SEC,
    DURATION_SEC,
    QUESTION_TIME_LIMIT_SEC,
} from '@/lib/customize/game-config';
import { Grade } from '@/lib/customize/words';
import { GameState, handleKeyInput, Mode } from '@/lib/judge';
import { createWordQueue, drawNextWord } from '@/lib/queue';
import { useEffect, useRef, useState } from 'react';

function createInitialState(grade: Grade, mode: Mode): GameState {
    const [currentWord, ...rest] = createWordQueue(grade);

    return {
        status: 'idle',
        grade,
        mode,
        currentWord,
        wordQueue: rest,
        typedLength: 0,
        mistakeInCurrentWord: false,
        combo: 0,
        score: 0,
        questionsShown: 1,
        questionElapsedMs: 0,
        remainingMs: DURATION_SEC * 1000,
    };
}

/**
 * 100msごとのtickを処理する。
 * チャレンジモードのみ、1問の経過時間がQUESTION_TIME_LIMIT_SECを超えたら
 * ミス扱いでスキップする(スコアは増やさず、コンボを0にリセット)。学習モードには適用しない。
 */
function handleTick(state: GameState, deltaMs: number): GameState {
    const remainingMs = Math.max(0, state.remainingMs - deltaMs);

    if (remainingMs <= 0) {
        return { ...state, remainingMs: 0, status: 'finished' };
    }

    if (state.mode !== 'challenge') {
        return { ...state, remainingMs };
    }

    const questionElapsedMs = state.questionElapsedMs + deltaMs;

    if (questionElapsedMs < QUESTION_TIME_LIMIT_SEC * 1000) {
        return { ...state, remainingMs, questionElapsedMs };
    }

    const { word: nextWord, queue: nextQueue } = drawNextWord(
        state.wordQueue,
        state.grade,
        state.currentWord.meaning,
    );

    return {
        ...state,
        remainingMs,
        currentWord: nextWord,
        wordQueue: nextQueue,
        questionsShown: state.questionsShown + 1,
        questionElapsedMs: 0,
        typedLength: 0,
        mistakeInCurrentWord: false,
        combo: 0,
    };
}

export function useGameLoop(grade: Grade, mode: Mode) {
    const [state, setState] = useState<GameState>(() =>
        createInitialState(grade, mode),
    );
    const [countdown, setCountdown] = useState(COUNTDOWN_SEC);
    const lastTickRef = useRef<number>(performance.now());

    useEffect(() => {
        if (state.status !== 'idle') {
            return;
        }

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setState((s) =>
                        s.status === 'idle' ? { ...s, status: 'playing' } : s,
                    );
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [state.status]);

    useEffect(() => {
        if (state.status !== 'playing') {
            return;
        }

        lastTickRef.current = performance.now();

        const interval = setInterval(() => {
            const now = performance.now();
            const deltaMs = now - lastTickRef.current;
            lastTickRef.current = now;

            setState((prev) =>
                prev.status === 'playing' ? handleTick(prev, deltaMs) : prev,
            );
        }, 100);

        return () => clearInterval(interval);
    }, [state.status]);

    const onKeyInput = (key: string) => {
        setState((prev) =>
            prev.status === 'playing' ? handleKeyInput(prev, key) : prev,
        );
    };

    const restart = () => {
        setState(createInitialState(grade, mode));
        setCountdown(COUNTDOWN_SEC);
    };

    return { state, onKeyInput, countdown, restart };
}
