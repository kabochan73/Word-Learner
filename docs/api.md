# ルート一覧

Inertiaアプリなので、ほとんどのルートは「JSONを返すAPI」ではなく**ページ(Reactコンポーネント)+propsを返すルート**になる。スコア保存だけは画面遷移を伴わない書き込み専用のルートとして、素のJSONを返す([backend/folder-structure.md](./backend/folder-structure.md))。認証はLaravel標準のセッション認証(Cookie+CSRF)。フォーム送信・`router.post`等は自動でCSRFトークンを付与する([backend/auth.md](./backend/auth.md))。

## 認証(Laravel Breeze標準)

### `GET /login` / `GET /register`
未ログイン限定。Inertiaページ(`Login` / `Register`)を返す。ログイン済みなら`/`へリダイレクト。

### `POST /login`
| body | 型 |
|---|---|
| name | string |
| password | string |

成功: `/`へリダイレクト(セッションCookieが発行される)。失敗: バリデーションエラーとしてログインフォームに返る。レートリミットあり([backend/auth.md](./backend/auth.md#ログインのレートリミット))

### `POST /register`
| body | 型 | 備考 |
|---|---|---|
| name | string | 1〜30文字、UNIQUE |
| password | string | 8文字以上(確認用`password_confirmation`も) |

成功: 登録と同時にログインし`/`へリダイレクト。失敗(名前重複等): バリデーションエラーとして登録フォームに返る。レートリミットあり

### `POST /logout`
認証必須。セッションを破棄して`/`へリダイレクト。

## トップページ・ゲーム画面

### `GET /`
認証不要。`grade`をクエリパラメータで受け取る(省略時`"1"`)。

Inertiaページ`Home`に以下のpropsを渡す:

| prop | 型 | 備考 |
|---|---|---|
| grade | string | 現在選択中の級 |
| ranking | `{ rank: number; name: string; bestScore: number }[]` | 選択中の級の上位10件(チャレンジモードのスコアのみ。[backend/database-schema.md](./backend/database-schema.md)の集計クエリで作成) |
| auth.user | `User \| null` | `HandleInertiaRequests`が全ページ共有で渡す([backend/auth.md](./backend/auth.md)) |

「SELECT LEVEL」で級を変えると、frontend側は`router.reload({ only: ['grade', 'ranking'], data: { grade } })`でこのルートにpartial reloadし、`ranking`だけ再取得する(ページ全体の再読み込みはしない、[frontend/routing.md](./frontend/routing.md))。

### `GET /play`
認証不要。`grade` `mode`をクエリパラメータで受け取る(トップページの選択値をそのまま引き継ぐ)。

バリデーション(2段階):
- **バックエンド**: `grade`が空でないこと、`mode`が`"practice"`または`"challenge"`のいずれかであることだけ検証する(バックエンドは級の一覧を持たないため、`grade`の値そのものが実在する級かどうかは検証しない)。どちらか欠落・`mode`が不正な場合は`/`へリダイレクト
- **フロントエンド**: `Pages/Play.tsx`が`WORDS_BY_GRADE[grade]`の存在を確認する。存在しない級なら同様に`/`へリダイレクト([frontend/game-engine.md](./frontend/game-engine.md))

Inertiaページ`Play`に以下のpropsを渡す:

| prop | 型 |
|---|---|
| grade | string |
| mode | `"practice"` \| `"challenge"` |

単語データ・ゲームロジックはすべてクライアント側(`resources/js/`)で完結する([frontend/game-engine.md](./frontend/game-engine.md))。

## ゲームセッション

### `POST /game-sessions`
認証必須。frontendはチャレンジモードのプレイ結果のみをここに送る(学習モードは送信しない)。画面遷移を伴わない書き込みなので、Inertiaページではなく素のJSONを返す。

| body | 型 | 備考 |
|---|---|---|
| grade | string | 20文字以内。値の一覧はバックエンドでは検証しない(`resources/js/lib/customize/words/`が定義する級の文字列をそのまま送る) |
| score | integer | 0以上 |

成功: `201` + `{ score: number }`。未ログイン: `401`(frontend側はログイン済みの場合のみこのルートを呼ぶため、通常到達しない)
