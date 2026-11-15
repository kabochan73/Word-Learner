# Laravel設計指針

このプロジェクトはテーブル2つ・ルート数個の小規模なアプリなので、DDD・Repositoryパターンのような重い設計は持ち込まない。ロジックが1箇所に集まっていればそれで十分。InertiaのControllerは「APIのJSON Resource」ではなく「`Inertia::render()`でページ+propsを返す」役割になる点がAPI専用構成と違う([01-overview.md](../01-overview.md))。

## レイヤー構成

| レイヤー | 置き場所 | 責務 |
|---|---|---|
| Route | `routes/web.php` | URLとコントローラの対応、ミドルウェア |
| Controller | `app/Http/Controllers/` | 入力を受け取りActionを呼び、`Inertia::render()`またはリダイレクト/JSONを返す |
| FormRequest | `app/Http/Requests` | 形式的バリデーション(失敗時はInertiaが自動でフォームのエラーとして返す) |
| Action | `app/Actions` | ビジネスロジック1ユースケース |
| Model | `app/Models` | リレーション・スコープ・キャスト |

データの流れ(ページ表示):
```
Request → Route → Controller → (読み取りクエリ) → Inertia::render('PageName', [props]) → Reactページ
```

データの流れ(書き込み):
```
Request → Route → Controller → FormRequest(バリデーション) → Action::execute() → redirect() または response()->json()
```

## 作るAction

| ドメイン | Action |
|---|---|
| GameSession | `RecordGameSession`(スコア保存) |

認証(登録/ログイン/ログアウト)はLaravel Breezeが提供するコントローラをそのまま使い、独自のActionは作らない([backend/auth.md](./auth.md))。ランキング取得は単純な読み取りのため、Actionを作らずControllerに直接クエリを書く([backend/database-schema.md](./database-schema.md)の代表的なクエリ)。

## ディレクトリ構成

```
app/
├── Actions/
│   └── GameSession/       RecordGameSession
├── Http/
│   ├── Controllers/
│   │   ├── Auth/           (Breeze標準。RegisteredUserController  AuthenticatedSessionController)
│   │   ├── HomeController         # `/`。grade propを受けてランキングを計算し、Inertia::render('Home', [...])
│   │   ├── PlayController         # `/play`。grade(必須のみ検証)/mode(enum検証)をクエリから受けてInertia::render('Play', [...])。不正なら`/`へリダイレクト([api.md](../api.md))
│   │   └── GameSessionController  # POST /game-sessions(store)
│   ├── Middleware/
│   │   └── HandleInertiaRequests.php  # auth.userを全ページに共有([backend/auth.md](./auth.md))
│   └── Requests/           GameSession/StoreGameSessionRequest
└── Models/                 User  GameSession
```

## 命名規約

| 対象 | 規約 | 例 |
|---|---|---|
| Action | 動詞+名詞、`execute()` | `RecordGameSession` |
| FormRequest | `{動詞}{モデル}Request` | `StoreGameSessionRequest` |
| Controller | `{対象}Controller`。ページを返すものはリソース名、書き込み専用のものは動詞寄りの名前でもよい | `HomeController` `GameSessionController` |

## バリデーションの層分担

| 層 | 何を | 例 |
|---|---|---|
| FormRequest | 形式・型・必須 | `score`は0以上の整数、`grade`は文字列・必須・20文字以内(具体的な値の一覧はバックエンドでは検証しない)、`name`は1〜30文字、`password`は8文字以上 |
| DB制約 | 最終防衛線 | `score >= 0` CHECK、`name` UNIQUE、FK |

## やらないことリスト

| 誘惑 | 判断 | 理由 |
|---|---|---|
| Repositoryパターン | 使わない | Eloquentが実質Repository。テーブル2つでは不要 |
| Service層 | 作らない | 外部システム連携が無いため置く理由がない |
| ランキング用のAction | 作らない | 単純な読み取りはController直書きで十分 |
| API Resource(JSON整形クラス) | 作らない | Inertiaはpropsとして素の配列/Eloquentモデルを渡せば十分で、JSON API向けのResourceクラスを挟む理由が無い |
