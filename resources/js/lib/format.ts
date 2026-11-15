// mm:ss形式の文字列に変換する。タイムボーナスで60秒を超えて延びることがあるため、
// 単純な秒数表示ではなく分:秒で組み立てる。
export function formatTime(ms: number): string {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const mm = Math.floor(totalSec / 60)
        .toString()
        .padStart(2, '0');
    const ss = (totalSec % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
}
