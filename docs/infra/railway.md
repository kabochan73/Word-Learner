# 本番デプロイ構成(Railway)

Laravel + Inertiaの単一アプリをRailwayの**サービス1つ**にデプロイする。フロントエンドとバックエンドが別オリジンに分かれていないため、分けてデプロイする理由がそもそも無い。

## サービス構成

| サービス | 内容 |
|---|---|
| `app` | Laravel + Inertia。ローカルの`php artisan serve`はあくまで開発用の簡易サーバーなので、本番用には別途nginx + php-fpm系のDockerfileを用意する(フェーズ6で検討)。デプロイ時のビルドステップで`npm run build`を実行し、Viteのビルド成果物(`public/build/`)をLaravelが配信する |
| PostgreSQL | Railwayのマネージドプラグインを追加するだけ(ローカルの`postgres:17`と同等) |

## ドメイン構成

単一アプリ・単一オリジンなので、ドメインに関する特別な考慮は不要([backend/auth.md](../backend/auth.md))。Railwayが自動発行するドメイン(`*.up.railway.app`)のまま公開してよく、独自ドメインを買う必要も無い。

## 環境変数(本番、ローカルとの差分のみ)

| 変数 | 値 | 備考 |
|---|---|---|
| `APP_URL` | 自動生成ドメイン(例: `https://word-learner-production.up.railway.app`) | |
| `APP_ENV` | `production` | |
| `SESSION_SECURE_COOKIE` | `true` | 本番はhttps |

その他(`DB_*`等)はRailwayのPostgresプラグインが発行する接続情報をそのまま使う。

## デプロイ手順(概要)

1. Railwayプロジェクトを作成し、PostgreSQLプラグインを追加
2. `app`サービスを追加(リポジトリのルートを指定、本番用Dockerfile)。ビルドステップで`composer install --no-dev`・`npm ci && npm run build`を実行
3. 環境変数を設定、初回起動時に`php artisan migrate --force`を実行
4. 自動生成ドメインでログイン→スコア保存→ランキング表示までの一連の動作を確認
