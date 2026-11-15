# 認証設計

## 方式

- **Laravel標準のセッション認証(web guard)+ CSRF**。InertiaはブラウザとLaravelが同一オリジンで動くことが前提のフレームワークなので、Cookieベースの通常のLaravel認証がそのまま使える(Sanctumは使わない)
- 土台は**Laravel Breezeの Inertia + Reactスターターキット**(`composer require laravel/breeze --dev` → `php artisan breeze:install react`)。認証コントローラ・ミドルウェア・ログイン/登録ページの雛形をここから作り、不要な部分(メール認証・パスワードリセット)を削除する
- ログイン状態は`HandleInertiaRequests::share()`で**全ページのpropsに`auth.user`として共有**される。ページコンポーネントは`usePage().props.auth.user`を見るだけでよく、別途「ログイン確認用のAPI」を叩く必要がない
- メール認証(アドレス確認)・パスワードリセットは実装しない。名前+パスワードのみで登録した時点でプレイ・ランキング参加まで一通り体験できる(Breezeのデフォルトに含まれるこれらの機能・ルート・ページは削除する)
- ログインはゲームのプレイ自体には不要で、**スコアをランキングに保存するときだけ**必要。認証必須なのは実質`POST /logout`・`POST /game-sessions`のみ

## Breezeから削除するもの

Breezeのデフォルトスキャフォールドには以下が含まれるが、今回は使わないため実装時に削除する:

- メール認証(`MustVerifyEmail`、`/verify-email`系ルート、`email_verified_at`列)
- パスワードリセット(`/forgot-password` `/reset-password`、`password_reset_tokens`テーブル、関連Mailable)
- プロフィール編集画面(名前変更・パスワード変更・退会は「やらないこと」)
- `email`列そのもの(`users.name`をログインIDにする、[backend/database-schema.md](./database-schema.md))

## セッション設定

```
# .env
SESSION_DRIVER=database
SESSION_LIFETIME=10080  # 分(7日)
```

同一オリジンなので`SESSION_DOMAIN`やサブドメイン間の共有設定は不要。CSRFトークンもLaravel標準のミドルウェア(`VerifyCsrfToken`)とInertiaの初期セットアップでそのまま機能する(フォーム送信・`router.post`等が自動でCSRFトークンを付与する)。

## ログインのレートリミット

独自のRateLimiterは定義せず、**Breeze標準の`LoginRequest`に既に実装されているレートリミット機構をそのまま使う**(`app/Http/Requests/Auth/LoginRequest.php`)。`name`+IPの組み合わせで1分あたり5回まで。超えると`Lockout`イベントが発火し、バリデーションエラーとして残り待機時間を返す(`429`ではなく`422`のバリデーションエラーとして表現される点がLaravel標準のthrottleミドルウェアと異なる)。

```php
public function throttleKey(): string
{
    return Str::transliterate(Str::lower($this->string('name')).'|'.$this->ip());
}
```

登録(`POST /register`)には`throttle:6,1`ミドルウェアを付与する(1分あたり6回まで)。

## ルート概要

詳細は[api.md](../api.md)参照。要点:

- `GET /login` / `GET /register`: Inertiaページを返す(未ログイン限定、ログイン済みなら`/`へリダイレクト)
- `POST /login`: レートリミット付き(上記[ログインのレートリミット](#ログインのレートリミット))。成功したら`/`にリダイレクトし、`auth.user`が以後のページ共有propsに乗る
- ログイン失敗時は「名前が無い」「パスワード違い」を区別しない。Inertiaのバリデーションエラーとして該当フォームに返る
- `POST /register`: 登録と同時にログインさせる(Breeze標準の挙動)
- `POST /logout`: 認証必須。セッションを破棄してセッションIDを再生成する

```php
public function store(LoginRequest $request)
{
    $request->authenticate(); // Auth::attempt() 相当。失敗時は例外→バリデーションエラーとしてInertiaに返る

    $request->session()->regenerate();

    return redirect()->intended('/');
}

public function destroy(Request $request)
{
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/');
}
```

## Inertia側でのログイン状態の扱い

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user(),
        ],
    ];
}
```

React側は`usePage<PageProps>().props.auth.user`(`null`または`User`)を見るだけで、ログイン状態に応じた表示分岐(トップページの「はじめる」導線、結果画面でのスコア保存可否など)ができる。[frontend/folder-structure.md](../frontend/folder-structure.md)も参照。
