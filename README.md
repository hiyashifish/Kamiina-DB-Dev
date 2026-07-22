# KAMIINA BOTAN CELLAR

Astro + microCMS で管理する非公式データベースサイトです。

## microCMSの設定

microCMSでリスト形式APIを1つ作成します。

- API名: Cards（任意）
- エンドポイント: `cards`

フィールドは次の順で作成してください。

| フィールドID | 表示名 | 種類 | 必須 |
| --- | --- | --- | --- |
| `episode` | 話数 | 数字 | はい |
| `title` | タイトル | テキストフィールド | はい |
| `caption` | 補足 | テキストフィールド | いいえ |
| `description` | 作中の説明 | テキストエリア | いいえ |
| `tag` | タグ | セレクトフィールド | はい |
| `href` | リンク | テキストフィールド | はい |

`tag` の選択肢には、現在使っている `SAKE`, `FOOD`, `MOVIE`, `SPOT`,
`BOOK`, `MUSIC`, `ITEM` を登録します。

`.env.example` を `.env` にコピーし、サービスドメインとGET専用APIキーを
設定してください。APIキーは公開せず、ホスティング先でも環境変数として設定します。

```env
MICROCMS_SERVICE_DOMAIN=your-service-domain
MICROCMS_API_KEY=your-read-only-api-key
MICROCMS_ENDPOINT=cards
```

環境変数が未設定のローカル環境では `src/data/cards.json` を表示するため、
microCMSの準備前でも開発できます。本番ビルド時はmicroCMSから全件を取得します。
100件を超えても自動でページングします。

## 既存JSONの初回移行

APIキーに一時的にPOST権限を付け、`.env` に次を追加します。

```env
MICROCMS_WRITE_API_KEY=your-write-api-key
```

次を一度だけ実行します。

```sh
npm run cms:import
```

二重登録を避けるため再実行はしないでください。移行後はPOST権限を外し、
`MICROCMS_WRITE_API_KEY` も削除します。サイト表示用キーはGET権限だけにします。

## 開発とビルド

```sh
npm run dev
npm run build
```

このサイトは静的ビルド時にmicroCMSを読み込みます。公開後の更新を反映するには、
microCMSのWebhookからホスティングサービスのデプロイフックを呼び出してください。
