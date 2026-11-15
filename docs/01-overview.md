# Word Learner — プロジェクト概要

**誰でもgit cloneして自分用に作り替えられる、お題入れ替え式のタイピングゲームのテンプレート**(「寿司打」のゲームメカニクス=制限時間・コンボ・タイムボーナスを引き継ぐ)。お題データとその判定方法を書き換えるだけで、英単語学習に限らずクイズ的な「問題→入力」形式のタイピングゲーム全般に転用できる([customization.md](./customization.md))。

このリポジトリ自体は、作者(本人、Laravel経験者)が**一例として英検5級/4級/3級の英単語学習用にお題を入れた状態**で公開する(ハッカソン提出物)。英単語学習は数ある使い方の一つであり、テンプレートの本質はお題の内容に依存しない。使う人は自分で単語帳を作る画面を使うのではなく、git cloneして`words`データをAIエージェントに書き換えさせることで、好きなお題のタイピングアプリをローカルで作れる。

## ゴール

- 60秒の制限時間内に、表示されたお題(このリポジトリでは「日本語の意味」)に対応する入力内容(このリポジトリでは「英単語のスペル」)をタイピングし、解いた問題数をスコアとするミニゲーム
- ノーミスで連続正解すると制限時間が延長される(寿司打のタイムボーナス方式)
- お題を**難易度別にグループ分け**できる(このリポジトリでは英検5級/4級/3級)。プレイ前にグループを選び、グループが違えば問題もランキングも別物
- **学習モード(答えを見ながら練習)とチャレンジモード(答えを隠して挑戦)**の2モード。級・モードの選択はトップページで行い、スコア保存・ランキング参加の対象はチャレンジモードのみ
- **ログインしなくてもプレイできる**。ログイン(名前+パスワードのみ)している場合だけスコアがランキングに記録される。ログイン必須なのはランキング参加のときだけで、ゲームを遊ぶこと自体には必要ない

## やらないこと

- 制限時間の難易度選択(60秒固定のみ。全級共通)。※単語セットの級選択(5級/4級/3級)とは別の話で、こちらは行う
- メール認証・パスワードリセット(メールアドレスを持たないため)
- ログイン後の名前変更・パスワード変更・退会機能(登録時のまま変更不可)
- ソーシャルログイン
- プレイ履歴・マイページ機能(クイズではなくタイピングゲームなので、ランキングがあれば十分という判断)
- 英単語のスペルの表記ゆれ対応(英米表記違い等)。v1は1語につき正規スペル1パターン
- 不正スコア対策の本格実装(クライアント側の自己申告スコアをそのまま信頼する。ハッカソン提出物のため)
- 単語帳を画面上で作成・保存・共有するノーコードの作成UI(「タイピングメーカー」のような機能)。単語セットの入れ替えはコード(`words`データ)の書き換えで行う
- 管理画面(お題の単語はコードに静的に持つだけで、CMS的な管理機能は作らない)
- モバイル専用UI最適化(レスポンシブで崩れない程度までで、物理キーボード前提のゲームなのでスマホ操作性は追求しない)

## 技術スタック

| 層               | 技術                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| アプリ本体       | Laravel + **Inertia.js** + React(TypeScript) + Tailwind CSS のモノリス構成                                           |
| 認証             | Laravel標準のセッション認証(web guard)+ CSRF。Sanctumは使わない                                                      |
| DB               | PostgreSQL                                                                                                           |
| ローカル実行形態 | Docker。`docker compose up -d`でapp(Laravel+Vite)/ dbが起動                                                          |
| 本番実行形態     | Railwayのサービス1つにデプロイ([infra/railway.md](./infra/railway.md))                                             |

## アーキテクチャ方針

- **フロントエンドとバックエンドを分離しない**。Laravelの各ルートがInertia経由でReactページを直接返す、単一オリジンのモノリス。当初Next.js(別オリジン)+Laravel(API)の分離構成を採用していたが、Next.jsを使う決め手だったSSR/ISR/SEOを実際には使わない設計だったため、Inertia+Reactに切り替えた
- 認証はLaravelの**セッション認証**。ログイン状態は`HandleInertiaRequests::share()`で`auth.user`として全ページに共有され、別途`/api/me`のようなfetchをする必要がない([backend/auth.md](./backend/auth.md))
- 単一オリジンのためCORS・Cookieのドメイン共有・カスタムドメインの用意、といった論点がそもそも発生しない
- お題の単語データはDB化せず、`resources/js/`側に静的な配列として持つ(管理機能が不要なため)
- ランキングは`game_sessions`テーブルを集計するだけで作れるので専用テーブルは持たない。専用のJSON APIも持たず、トップページのInertiaページがpropとして渡す

## 構成図(ローカル)

```
ブラウザ
  │ GET / , POST /login , POST /game-sessions ...
  ▼
localhost:8000 ── appコンテナ(nginx → php-fpm → Laravel + Inertia)
                          │
                          └─→ db:5432 (PostgreSQL)
```

## リポジトリ構成

```
word-learner/
├── docs/            # このフォルダ。設計・決定事項のドキュメント
├── AGENTS.md        # cloneした人のAIエージェント向けの入口。docs/customization.mdを指す
├── app/              # Laravelアプリケーションコード(Controllers/Models等)
├── resources/
│   └── js/           # Inertiaのページ・コンポーネント(React)
├── routes/
│   └── web.php
├── database/
│   └── migrations/
└── docker-compose.yml
```

## 機能スコープ

詳細は[03-features.md](./03-features.md)参照。

- 認証(登録/ログイン/ログアウト)
- タイピングゲーム本体(級・モード選択・日本語の意味の表示・英単語の入力判定・タイマー・コンボ・タイムボーナス・スコア計算)
- ランキング(全ユーザーのベストスコア上位表示)

## ドキュメント一覧

| ファイル                                                       | 内容                                                |
| -------------------------------------------------------------- | --------------------------------------------------- |
| [03-features.md](./03-features.md)                             | 機能スコープ確定版                                  |
| [04-implementation-roadmap.md](./04-implementation-roadmap.md) | 実装ロードマップ・コミット規約                      |
| [api.md](./api.md)                                             | ルート一覧(Inertiaページ+書き込み系ルート)          |
| [backend/database-schema.md](./backend/database-schema.md)     | テーブル定義とER                                    |
| [backend/auth.md](./backend/auth.md)                           | 認証設計(Laravel標準のセッション認証)               |
| [backend/folder-structure.md](./backend/folder-structure.md)   | Laravel側のレイヤー構成                             |
| [frontend/folder-structure.md](./frontend/folder-structure.md) | Inertia(React)側のディレクトリ構成                  |
| [frontend/routing.md](./frontend/routing.md)                   | サイトマップ・各ページの構成                        |
| [frontend/game-engine.md](./frontend/game-engine.md)           | タイピングゲーム本体のロジック設計                  |
| [infra/local-dev.md](./infra/local-dev.md)                     | ローカル開発環境(Docker Compose)                    |
| [infra/railway.md](./infra/railway.md)                         | 本番デプロイ構成(Railway)                           |
| [customization.md](./customization.md)                         | fork/clone して自分用に作り替える方法、コメント規約 |
