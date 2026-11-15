import { describe, expect, it } from 'vitest';
import { formatTime } from '../../lib/format';

describe('formatTime', () => {
    it('60秒未満はmm:ss(00:ss)で表示する', () => {
        expect(formatTime(5000)).toBe('00:05');
    });

    it('60秒以上はmm:ssの分がインクリメントされる(ボーナスで60秒を超える場合)', () => {
        expect(formatTime(65000)).toBe('01:05');
    });

    it('0以下はマイナスにならず00:00になる', () => {
        expect(formatTime(-1000)).toBe('00:00');
    });

    it('端数は切り上げる', () => {
        expect(formatTime(1001)).toBe('00:02');
    });
});
