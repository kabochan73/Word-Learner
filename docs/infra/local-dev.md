# ローカル開発環境(すべてDocker)

## 方針

- `docker compose up -d`だけで開発環境が全部立ち上がる。app(Laravel)/ node(開発用アセットサーバー)/ dbをすべてコンテナで動かす
- ホストにPHP / Composer / Nodeを入れない。`php artisan serve`や`npm run dev`はホストでは打たない
- artisan / composer / npmはすべて`docker compose exec`経由(初回のcomposer create-project等は一時的なComposerコンテナで実行)
- ソースはバインドマウント(コード編集は即反映)

Inertiaはフロント・バックエンドが別オリジンではないため、「frontend/backend 2サービスが別々に動いて相互に通信する」構成ではなく、**Laravelアプリ1つ+開発用のVite dev serverという組み合わせ**になる。

## サービス一覧

| サービス | イメージ / ビルド | 役割 | ホスト公開ポート |
|---|---|---|---|
| `app` | 自前の`Dockerfile`(`php:8.5-cli` + `pdo_pgsql`) | Laravel + Inertia。`php artisan serve`で直接起動(本番はこの通りではなく別途nginx等を検討) | `8000` |
| `node` | `node:22` | `npm run dev`(Vite dev server、HMR用。本番ではビルド成果物をLaravelが配信するだけなので不要) | `5173` |
| `db` | `postgres:17` | PostgreSQL | `5432` |

キュー・スケジューラ・ストレージ・メール送信を使う機能が無いため、この3サービスのみで足りる。

### 通信経路

```
ブラウザ
  │ GET / , POST /login , POST /game-sessions ...(同一オリジン、Cookie+CSRF)
  ▼
localhost:8000 ── appコンテナ(php artisan serve)
  │        ▲
  │        └─ 開発中はVite dev server(localhost:5173)からアセットをHMR付きで読み込む
  ▼
db:5432
```

## docker-compose.ymlの要点

```yaml
services:
  app:
    build: .
    ports: ["8000:8000"]
    volumes:
      - .:/var/www/html
    depends_on:
      - db

  node:
    image: node:22
    user: "${HOST_UID:-1000}:${HOST_GID:-1000}"
    working_dir: /var/www/html
    environment:
      npm_config_cache: /tmp/.npm
    command: sh -c "npm install --legacy-peer-deps && npm run dev -- --host 0.0.0.0"
    volumes:
      - .:/var/www/html
    ports: ["5173:5173"]

  db:
    image: postgres:17
    environment:
      POSTGRES_DB: word_learner
      POSTGRES_USER: word_learner
      POSTGRES_PASSWORD: password
    ports: ["5432:5432"]
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

`node`サービスは`HOST_UID` / `HOST_GID`をホストのUID/GIDに合わせて渡す(`node_modules`がrootユーザー所有になって編集・削除に困らないようにするため)。起動時は`HOST_UID=$(id -u) HOST_GID=$(id -g) docker compose up -d`のように渡す。

## 環境変数(ローカル)

### .env(要点)

| 変数 | 値 |
|---|---|
| `APP_URL` | `http://localhost:8000` |
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST` | `db` |
| `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | `word_learner` / `word_learner` / `password` |
| `SESSION_DRIVER` | `database` |

`FRONTEND_URL`・`SANCTUM_STATEFUL_DOMAINS`・CORS関連の設定は不要(単一オリジンのため、[backend/auth.md](../backend/auth.md))。

## 初回セットアップ

```bash
cp .env.example .env

HOST_UID=$(id -u) HOST_GID=$(id -g) docker compose up -d --build

docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
```

## よく使うコマンド

```bash
HOST_UID=$(id -u) HOST_GID=$(id -g) docker compose up -d
docker compose down            # データは残る
docker compose logs -f app

docker compose exec app php artisan migrate
docker compose exec app php artisan tinker

docker compose logs -f node
```

## トラブルシュート

| 症状 | 対処 |
|---|---|
| アセットの変更が反映されない | `node`コンテナが起動しているか確認(`docker compose logs -f node`) |
| `vendor`が無い | 一時的なComposerコンテナで`composer install`を実行(`docker run --rm --user "$(id -u):$(id -g)" -v "$(pwd)":/var/www/html -w /var/www/html composer:2 install`) |
| `could not translate host name "db"` | `.env`の`DB_HOST=db`(`127.0.0.1`はコンテナ自身) |
| ログインしても認証状態が保持されない | `SESSION_DRIVER=database`になっているか、`sessions`マイグレーションを実行済みか確認 |
| 書き込みルートが419(CSRFトークン不一致) | ブラウザのCookieが残っているか確認。開発中に`APP_KEY`を再生成すると既存セッションが無効になるため、Cookieを削除して再ログインする |
| `node_modules`がrootユーザー所有になる | `HOST_UID` / `HOST_GID`を渡さずに`docker compose up`した場合に起きる。渡し直して`npm install`を再実行する |
