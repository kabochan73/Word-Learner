# Word Learner

**[https://app-production-88c956ac.up.railway.app/](https://app-production-88c956ac.up.railway.app/)**

**誰でもgit cloneして自分用に作り替えられる、お題入れ替え式のタイピングゲームのテンプレート**です。「寿司打」のタイムアタック・コンボボーナスのゲーム性を引き継ぎつつ、お題とその判定方法を書き換えるだけで、英単語学習に限らずクイズ的な「問題→入力」形式のタイピングゲーム全般に転用できます。

このリポジトリ自体は、作者が**一例として英検5級/4級/3級の英単語学習用にお題を入れた状態**で公開しています。英単語学習は数ある使い方の一つであり、テンプレートの本質はお題の内容に依存しません。

## 自分用に作り替える

git cloneしたら、お使いのAIコーディングエージェント(Claude Code、Cursorなど)に話しかけるだけで単語セットを入れ替えられます。

> 「このゲームのお題をTOEICの英単語に変えて」
> 「英単語じゃなくて漢字の読み方クイズにして」

このリポジトリには`AGENTS.md`(`CLAUDE.md`も同内容)が置いてあり、AIエージェントがそれを読めば[docs/customization.md](./docs/customization.md)に沿って`resources/js/lib/customize/`配下(お題データ・制限時間などの定数)を編集してくれます。手で編集したい場合も同じ場所を見てください。それ以外の`resources/js/lib/`配下はゲームの内部ロジックなので、触る必要はありません。

## ローカルで動かす

詳細は [docs/infra/local-dev.md](./docs/infra/local-dev.md) を参照。ホストにPHP/Composer/Nodeは不要で、すべてDockerコンテナ内で動きます。

```bash
cp .env.example .env

HOST_UID=$(id -u) HOST_GID=$(id -g) docker compose up -d --build

docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
```

`http://localhost:8000` でアプリにアクセスできる。

## 遊び方

1. トップページで級(5級/4級/3級)とモードを選ぶ
   - 学習モード: 答えを見ながら練習する
   - チャレンジモード: 答えを隠して挑戦する。ログインしていればスコアがランキングに記録される
2. 「START GAME」を押すと3秒のカウントダウンのあとスタート
3. 60秒以内にできるだけ多くの単語をタイピングする。ノーミスで5問連続正解するごとに残り時間+2秒のボーナス

ログインしなくても遊べる。ログインが必要なのはスコアをランキングに残すときだけ。

## テスト

```bash
docker compose exec app php artisan test       # バックエンド
docker compose exec node npx vitest run        # フロントエンド(ゲームロジック)
docker compose exec node npx tsc --noEmit       # 型チェック
```

## 技術スタック

Laravel + Inertia.js + React(TypeScript)+ Tailwind CSS のモノリス構成、PostgreSQL、Railwayへのデプロイ。

## ドキュメント

詳しい設計・決定事項は [docs/](./docs/01-overview.md) を参照してください。
