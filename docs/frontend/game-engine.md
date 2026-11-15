# タイピングゲーム本体の設計

ゲームロジックはすべてクライアント側(`resources/js/`、[frontend/folder-structure.md](./folder-structure.md))で完結する。サーバーに問い合わせるのはゲーム終了後のスコア保存のみ。

## お題データ(`lib/customize/words/`)

お題(`meaning`)を表示し、対応する入力内容(`word`)をタイピングする。このリポジトリの例では、`meaning`に日本語の意味、`word`に英単語のスペルを入れている。DB化せず静的ファイルとして持つ(本人がコードを編集してデプロイする運用。管理画面は作らない)。このリポジトリでは英検5級/4級/3級のように**級ごとに難易度の違うお題セット**を提供するため、カテゴリではなく級単位でファイルを分ける。

```
lib/
├── customize/
│   └── words/
│       ├── index.ts     # 級ごとにWORDS_BY_GRADEとしてexport
│       ├── grade1.ts    # 英検5級(易しい順の1番目)
│       ├── grade2.ts    # 英検4級
│       └── grade3.ts    # 英検3級
└── queue.ts             # バッグ方式の出題キュー(createWordQueue / drawNextWord、触らなくていいロジック)
```

```ts
// lib/customize/words/grade1.ts
// CUSTOMIZE: ここに単語を追加すると5級のお題に出るようになる。wordは正規スペル1パターンのみ対応
export const GRADE1_WORDS: Word[] = [
  { meaning: "猫", word: "cat" },
  { meaning: "犬", word: "dog" },
];
```

```ts
// lib/customize/words/index.ts
import { GRADE1_WORDS } from "./grade1";
import { GRADE2_WORDS } from "./grade2";
import { GRADE3_WORDS } from "./grade3";

// CUSTOMIZE: meaning(表示するお題)とword(タイピングする入力内容)のペア。
// 英単語学習以外の用途(別言語・別テーマ)に使う場合もこの2フィールドの意味を入れ替えるだけで動く
export type Word = { meaning: string; word: string };

// CUSTOMIZE: キーは易しい順の通し番号("1"/"2"/"3")。別の区分(難易度ラベル等)にしたい場合はキーを変える
export type Grade = "1" | "2" | "3";

export const WORDS_BY_GRADE: Record<Grade, Word[]> = {
  "1": GRADE1_WORDS,
  "2": GRADE2_WORDS,
  "3": GRADE3_WORDS,
};
```

単語を追加するときは該当する級のファイルに1行追加するだけで済む。v1は1語につき正規スペル1パターンのみ(英米表記違い等の複数表記は対応しない)。

## 出題順(バッグ方式、`lib/queue.ts`)

完全ランダムではなく、**その級のお題リストを1回シャッフルして使い切るまで繰り返さない「バッグ方式」**を採用する。同じお題が短い間隔で何度も出る偏りを防ぎ、1ゲーム内でなるべく多くのお題に触れられるようにする。

```ts
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

// キューの先頭を1件取り出す。空になっていたら作り直す。
// 作り直した直後の1件目が直前の単語と同じにならないよう入れ替える(連続した同一単語を避ける)
export function drawNextWord(
  queue: Word[],
  grade: Grade,
  previousMeaning: string | null
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
```

ゲーム開始時に`createWordQueue(grade)`でキューを作り、先頭を取り出して最初の`currentWord`にする(`score: 0` `questionsShown: 1` `questionElapsedMs: 0`で開始)。以降は単語を1問正解するか、チャレンジモードで時間切れになるたびに`drawNextWord`で次の単語を取り出し、残りを`GameState.wordQueue`に保持する。

## 級・モードの選択

級(`Grade`)とモード(`Mode`)は**トップページ(`/`)で選択**し、「START GAME」を押した時点の選択値を持って`/play`に遷移する(`/play`自体には選択UIを置かない、[frontend/routing.md](./routing.md))。

```ts
// CUSTOMIZE: 学習モード(答えを見ながら練習)とチャレンジモード(答えを隠して挑戦)
export type Mode = "practice" | "challenge";
```

- `practice`(学習モード): 入力欄に入力済みの文字(`typedLength`分)と残りの文字(`currentWord.word`の続き)を両方表示する。残りの文字がグレー表示されるため、実質的にヒントとして機能する。スコアは保存しない
- `challenge`(チャレンジモード): 入力済みの文字のみ表示し、残りの文字は表示しない(答えは見えない)。ゲーム終了後、ログイン済みならスコアを保存する

選択結果は`GameState.grade` / `GameState.mode`として保持し、出題キューの作成・入力欄の表示方法・スコア保存可否のすべてに使う。

`Pages/Play.tsx`はマウント時に`WORDS_BY_GRADE[grade]`が存在するか確認する。存在しない級(バックエンドは級の一覧を持たないため不正な`grade`でもここまで通ってくる)なら`router.visit('/')`でトップページへリダイレクトする。

## ゲーム状態(`useGameLoop`)

```ts
type GameState = {
  status: "idle" | "playing" | "finished";
  grade: Grade;              // 開始前に選択した級
  mode: Mode;                // 開始前に選択したモード
  currentWord: Word;
  wordQueue: Word[];        // バッグ方式の残りキュー(createWordQueue/drawNextWord、[出題順(バッグ方式)](#出題順バッグ方式libwordsqueuets)参照)
  typedLength: number;      // 現在の単語で何文字入力済みか
  mistakeInCurrentWord: boolean;
  combo: number;            // ノーミスで連続正解した単語数
  score: number;            // 正解して完了した単語数(ランキング対象のスコア)
  questionsShown: number;   // 画面に出した単語の総数(完了・スキップ問わず。問題番号の表示に使う)
  questionElapsedMs: number; // 現在の単語が表示されてからの経過時間(チャレンジモードの時間切れスキップ判定用)
  remainingMs: number;
};
```

## 定数(`lib/customize/game-config.ts`)

```ts
export const DURATION_SEC = 60;
export const BONUS_COMBO_THRESHOLD = 5; // 5問ごとに
export const BONUS_SECONDS = 2;         // +2秒
// CUSTOMIZE: チャレンジモードで1問に使える時間(秒)。超えると自動でスキップされる
export const QUESTION_TIME_LIMIT_SEC = 7;
```

## タイマー

- `status`が`"playing"`になったら`setInterval`で100msごとに`remainingMs`を減算
- `remainingMs <= 0`になったら`status = "finished"`にしてタイマーを止め、結果画面を表示
- 表示は`mm:ss`形式(例: `01:24`)。タイムボーナスで60秒を超えて延びることがあるため、単純な秒数表示ではなく分:秒で組み立てる

```ts
function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const mm = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}
```

## 1問あたりの制限時間(チャレンジモードのみ、自動スキップ)

チャレンジモードでは、1問に使える時間を`QUESTION_TIME_LIMIT_SEC`(7秒)に制限する。答えが見えている学習モードには適用しない。残り時間を示す視覚的なフィードバック(プログレスバー等)は表示しない。裏でタイマーが動いているだけで、時間切れになった瞬間に次の問題へ切り替わる。

同じ100msごとのtickで`questionElapsedMs`も加算し、制限時間を超えたら**ミス扱いでスキップ**する(スコアは増やさず、コンボは0にリセットして次の単語を出題する)。

```ts
function handleTick(state: GameState, deltaMs: number): GameState {
  const remainingMs = Math.max(0, state.remainingMs - deltaMs);

  if (remainingMs <= 0) {
    return { ...state, remainingMs: 0, status: "finished" };
  }

  if (state.mode !== "challenge") {
    return { ...state, remainingMs };
  }

  const questionElapsedMs = state.questionElapsedMs + deltaMs;

  if (questionElapsedMs < QUESTION_TIME_LIMIT_SEC * 1000) {
    return { ...state, remainingMs, questionElapsedMs };
  }

  // 制限時間超過: ミス扱いでスキップ。スコアは増やさない
  const { word: nextWord, queue: nextQueue } = drawNextWord(
    state.wordQueue,
    state.grade,
    state.currentWord.meaning
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
```

## 問題番号の表示

画面上部に「QUESTION 01」のように現在の問題番号を表示する。値は`state.questionsShown`(完了・スキップ問わず画面に出した単語の総数)。スコア(`state.score`、ランキング対象)とは別のカウンタなので、スキップしても問題番号はちゃんと進む。

## 入力判定(`lib/judge.ts`)

1文字ずつキー入力イベントを受け、現在の単語の`word`文字列の`typedLength`番目の文字と比較する(大文字小文字は区別しない)。

```ts
function handleKeyInput(state: GameState, key: string): GameState {
  const expected = state.currentWord.word[state.typedLength].toLowerCase();

  if (key.toLowerCase() !== expected) {
    // ミス: 入力は無視し、ミスフラグだけ立てる(コンボ判定用)
    return { ...state, mistakeInCurrentWord: true };
  }

  const typedLength = state.typedLength + 1;
  const wordCompleted = typedLength === state.currentWord.word.length;

  if (!wordCompleted) {
    return { ...state, typedLength };
  }

  // 単語完了
  const combo = state.mistakeInCurrentWord ? 0 : state.combo + 1;
  const bonusTriggered = combo > 0 && combo % BONUS_COMBO_THRESHOLD === 0;
  const { word: nextWord, queue: nextQueue } = drawNextWord(
    state.wordQueue,
    state.grade,
    state.currentWord.meaning
  );

  return {
    ...state,
    score: state.score + 1,
    questionsShown: state.questionsShown + 1,
    questionElapsedMs: 0,
    combo: bonusTriggered ? 0 : combo,
    remainingMs: bonusTriggered ? state.remainingMs + BONUS_SECONDS * 1000 : state.remainingMs,
    currentWord: nextWord,
    wordQueue: nextQueue,
    typedLength: 0,
    mistakeInCurrentWord: false,
  };
}
```

- ミスはコンボをリセットするだけで、入力自体はブロックしない(正しいキーが押されるまで`typedLength`は進まない)
- スコアは単語完了ごとに+1(ミスの有無に関わらず)。コンボ条件とは独立
- チャレンジモードの時間切れスキップ(上記[1問あたりの制限時間](#1問あたりの制限時間チャレンジモードのみ自動スキップ))もミス扱いで、こちらはスコアを増やさずコンボを0にリセットする

## ゲーム終了とスコア保存

スコア保存の対象は**チャレンジモード(`mode === "challenge"`)かつログイン済みの場合のみ**。学習モードは答えを見ながら打てる分ランキングと比較しても意味が無いため、保存自体を行わない。

1. タイマーが0になったら`status = "finished"`
2. 結果画面(`ResultScreen`)にスコアと級を表示
3. `state.mode`で分岐:
   - **学習モード**: 保存は行わず、「チャレンジモードで挑戦するとランキングに参加できます」という導線を表示するのみ
   - **チャレンジモード**: `usePage<PageProps>().props.auth.user`でログイン状態を確認([backend/auth.md](../backend/auth.md))
     - ログイン済み: `axios.post('/game-sessions', { grade: state.grade, score })`で保存し、保存成功後に「(この級の)ランキングを見る」への導線を表示
     - 未ログイン: 保存リクエストを送らず、「ログインするとランキングに記録されます」という導線(`/login`へのリンク)を表示
4. スコア保存に失敗した場合(ネットワークエラー等)はリトライボタンを出す。ゲーム自体のやり直しは不要(スコアはローカルのstateに残っているため再送できる)
