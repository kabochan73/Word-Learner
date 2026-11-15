# Inertia(React)側のディレクトリ構成

Laravel Breezeの Inertia + Reactスターターキットの標準構成(`Pages/` `Components/`)をベースに、ゲーム本体のドメインロジックだけ`lib/`にまとめる。別オリジンのフロントが無いため、APIクライアントや認証トークンの管理コードは存在しない。

## 方針

- ルーティングはLaravel側(`routes/web.php`)が持つ。`Pages/`配下のファイル名がそのまま`Inertia::render('Home', ...)`の文字列に対応する([frontend/routing.md](./routing.md))
- ログイン状態は`usePage<PageProps>().props.auth.user`で取得する。別途fetchする仕組みは無い([backend/auth.md](../backend/auth.md))
- 画面遷移を伴わない書き込み(スコア保存)は、Breeze標準でセットアップ済みのaxios(`resources/js/bootstrap.js`。CSRF用の`XSRF-TOKEN`Cookieを自動で見てヘッダに付与する)でそのままPOSTする

## ディレクトリ構成

```
resources/js/
├── app.tsx                    # createInertiaApp のエントリポイント
├── bootstrap.js                # axios初期設定(Breeze標準。CSRF自動付与)
├── types.ts                    # PageProps(auth.user等の共有props)、Word、Grade、Mode
├── Pages/
│   ├── Home.tsx                 # `/` トップページ(級・モード選択、ランキング表示)
│   ├── Play.tsx                 # `/play` ゲーム画面
│   └── Auth/
│       ├── Login.tsx
│       └── Register.tsx
├── Components/
│   ├── ui/                      Button  Field
│   ├── home/                    LevelSelect  ModeSelect  StartGameButton
│   ├── game/                    TypingGame  ResultScreen  Timer
│   └── ranking/                 RankingSidebar(`ranking`をpropsで受け取り表示するだけ)
├── lib/
│   ├── customize/                自由に編集していいファイル([customization.md](../customization.md))
│   │   ├── words/                 お題データ。級別ファイル+Grade型・WORDS_BY_GRADEを持つindex.ts
│   │   └── game-config.ts         定数(DURATION_SEC・BONUS_*・QUESTION_TIME_LIMIT_SEC・COUNTDOWN_SEC)
│   ├── judge.ts                  入力判定ロジック(触らなくていいロジック)
│   ├── queue.ts                  バッグ方式の出題キュー([frontend/game-engine.md](./game-engine.md))
│   └── format.ts                  formatTime
└── hooks/
    └── useGameLoop.ts
```

**規約**: `.tsx`はJSXを返す関数だけ。ゲームロジック(`lib/`配下)はReactに依存しない純粋なTypeScript関数として書き、`Pages/Play.tsx`や`hooks/useGameLoop.ts`から呼び出す。

## ページとpropsの受け渡し

各`Pages/*.tsx`はLaravelのControllerが`Inertia::render()`で渡したpropsをそのまま受け取る([api.md](../api.md))。

```tsx
// Pages/Home.tsx
type HomeProps = {
  grade: Grade;
  ranking: RankingEntry[];
};

export default function Home({ grade, ranking }: HomeProps) {
  // ...
}
```

級選択(`LevelSelect`)を変更したときは、Inertiaのpartial reloadで`ranking`だけ再取得する(ページ全体の再読み込みはしない):

```tsx
router.reload({ only: ["grade", "ranking"], data: { grade: nextGrade } });
```

## スコア保存

`Pages/Play.tsx`がゲーム終了時、チャレンジモードかつログイン済み(`usePage().props.auth.user`が非null)の場合のみ`axios.post('/game-sessions', { grade, score })`を呼ぶ([frontend/game-engine.md](./game-engine.md))。CSRFトークンの手動付与やAuthorizationヘッダの組み立ては不要(Breeze標準のaxios設定が担う)。
