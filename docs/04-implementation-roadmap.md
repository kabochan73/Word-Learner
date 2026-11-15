# 実装ロードマップ(清書・再デプロイ版)

[susida1](../../Susida1)は一つ前に作った**プロトタイプ**。今回はそのファイルをコピーするのではなく、susida1を参考資料にしながら**このリポジトリ(`word-learner`)として0から実装し直し、Railwayにデプロイする**。susida1のgit履歴も引き継がず、`word-learner`は新規に`git init`する。コード(CSS・Reactコンポーネントなど)は1ステップずつ実装してユーザーに提示し、確認を得てからコミットする(下記コミット規約参照)。

進捗はこのファイルのチェックボックスで管理する。

## コミット規約

- コミットする前に必ず変更内容をユーザーに提示し、確認を得てからコミットする
- フェーズ・ステップ単位で、1ステップ実装したらすぐコミットする
- ロードマップのチェックボックス更新は、そのステップの実装コミットに含める
- バックエンド・フロントエンドを層ごとに一気に作るのではなく、**機能単位(縦スライス)で1つずつ**作る(詳細はフェーズ3・4参照)
- 1回の実装・1回のコミットで触るファイルは**5ファイル前後**を目安にする(susida1からのコピーではなく、都度書き直す)

## フェーズ1: ドキュメント整理

susida1の`docs/`(を清書した`Susida2/docs/`)を1ファイルずつ確認し、「誰でもcloneして使えるタイピングゲームのテンプレート(英単語学習は一例)」という位置づけで`word-learner/docs/`に配置する。開発過程のログ(決定の経緯・進捗チェックリストそのもの)は役目を終えたものとして持ち越さない。

- [x] 1. `01-overview.md`: プロジェクト概要をテンプレート前提の書き方でコピー
- [x] 2. `02-decisions-log.md`: 内容は各ドキュメントの仕様に反映済みのため、持ち越さず削除(経緯ログは今回不要と判断)
- [x] 3. `03-features.md`: 機能一覧をコピー
- [x] 4. `04-implementation-roadmap.md`: このファイル自体を清書・再デプロイ版として書き直す(今回)
- [x] 5. `api.md` `backend/*.md` `frontend/*.md` `infra/*.md` `customization.md` を1つずつ確認し、必要な修正をしてコピー(`infra/*.md`は実際のDocker構成(`php:8.5-cli` + `php artisan serve`、サービス名`node`)に合わせて書き直した)

## フェーズ2: 環境構築

まず土台を整える。

- [x] 6. `Word Learner`フォルダで新規に`git init`(susida1のgit履歴は引き継がない)
- [x] 7. 設定ファイル: `composer.json`(name/description) `package.json`(name/description) `.env`/`.env.example`(APP_NAME)
- [x] 8. インフラ定義: `docker-compose.yml`、`.env.example`(Laravel + Docker(PHP8.5) + Breeze(Inertia/React) + PostgreSQLまで構築・確認済み。Vite開発サーバーもDocker化済み)
- [x] 9. GitHubに新規リポジトリ`word-learner`を作成、初回コミット・push(ユーザー自身が実施済み)

## フェーズ3・4: 機能単位の実装(バックエンド+フロントエンド)

susida1の`app/` `routes/` `database/` `resources/`を参考資料にしながら、コピーせずに1機能ずつ作り直す。各機能は「バックエンド→フロントエンド→動作確認→コミット」を1セットとし、1回の実装・コミットで触るファイルは5ファイル前後を目安にする。

### 3-A. 認証機能

- [x] 10. `users`マイグレーションの調整(email系カラム削除、name をUNIQUEに)、`password_reset_tokens`マイグレーション削除、`User`モデルの調整
- [ ] 11. Breeze標準から不要な機能を削除(メール認証・パスワードリセット・プロフィール編集・Dashboard関連のController/Request/Page/Routeを削除)
- [ ] 12. 残すログイン/登録のバックエンド調整(`routes/web.php`の認証系ルート、`LoginRequest`等の確認)
- [ ] 13. 残すログイン/登録のフロントエンド(`Pages/Auth/Login` `Register`、`Layouts/GuestLayout`、共通UI `Components/`)をTypeScript化しつつ整理
- [ ] 14. 動作確認(登録→ログイン→ログアウト)してコミット

### 3-B. ゲーム本体(ゲームエンジン)

- [ ] 15. お題データ(`resources/js/lib/customize/words/`)・出題キュー(`lib/queue.ts`)・入力判定(`lib/judge.ts`)
- [ ] 16. ゲーム状態管理(`hooks/useGameLoop.ts`)・定数(`lib/customize/game-config.ts`)
- [ ] 17. `PlayController`・`routes/web.php`の`/play`ルート
- [ ] 18. `Pages/Play.tsx`・タイピングUI関連コンポーネント(`Components/game/`)
- [ ] 19. 動作確認(級・モード選択→タイピング→タイムアップ)してコミット(DB保存はまだ行わない)

### 3-C. スコア保存とランキング

- [ ] 20. `game_sessions`マイグレーション・`GameSession`モデル・`RecordGameSession` Action
- [ ] 21. `GameSessionController`(`POST /game-sessions`)・`StoreGameSessionRequest`
- [ ] 22. `HomeController`(ランキング集計クエリ)・`routes/web.php`の`/`ルート
- [ ] 23. `Pages/Home.tsx`(級・モード選択、`Components/home/`)・`Components/ranking/RankingSidebar`
- [ ] 24. 結果画面でのスコア保存(`Components/game/ResultScreen`)
- [ ] 25. 動作確認(チャレンジモードでプレイ→スコア保存→ランキング反映)してコミット

### 3-D. テスト

- [ ] 26. バックエンド側のテスト: `tests/`
- [ ] 27. フロントエンド側のテスト: `resources/js/tests/`

## フェーズ5: ローカル動作確認

- [ ] 28. `.env`作成・`docker compose up -d --build`
- [ ] 29. `composer install` `php artisan key:generate` `php artisan migrate`
- [ ] 30. 登録→ログイン→プレイ(学習/チャレンジ×各級)→スコア保存→ランキング表示までの一連の動作をブラウザで確認

## フェーズ6: Railwayへの本番デプロイ

- [ ] 31. Railwayプロジェクトを作成しPostgresプラグイン・`app`サービスを追加、環境変数設定([infra/railway.md](./infra/railway.md))
- [ ] 32. ビルドステップで`composer install --no-dev`・`npm ci && npm run build`が通ることを確認
- [ ] 33. 自動生成ドメインでログイン→スコア保存→ランキング表示までの一連の動作を確認
