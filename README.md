# Beauty Salon SNS Content Generator

美容室向けのSNS投稿生成アプリケーション

## 🚀 クイックスタート

### 1. リポジトリのクローン
```bash
git clone https://github.com/your-username/beauty-salon-sns-generator.git
cd beauty-salon-sns-generator
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
```bash
cp .env.example .env.local
# .env.local を編集してAPIのURLを設定
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

## 技術スタック

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + Python + PostgreSQL (別リポジトリ)
- **認証**: httpOnly Cookie + JWT
- **デプロイ**: Vercel (Frontend) + Render (Backend)

## 📁 プロジェクト構成

```
src/
├── components/          # Reactコンポーネント
│   ├── auth/           # 認証関連
│   ├── dashboard/      # ダッシュボード
│   ├── generation/     # 投稿生成
│   ├── layout/         # レイアウト
│   ├── salon/          # 店舗情報
│   └── ui/             # UIコンポーネント
├── contexts/           # Reactコンテキスト
├── types/              # TypeScript型定義
└── utils/              # ユーティリティ関数
```

## 環境変数設定

### ローカル開発時

`.env.local` ファイルを作成：

```env
VITE_API_URL=http://localhost:8000
```

### Vercelデプロイ時

Vercelの環境変数設定：

```
VITE_API_URL=https://your-backend-api.render.com
```

### ngrok使用時（ローカルバックエンドテスト）

```env
VITE_API_URL=https://your-ngrok-url.ngrok.io
```

## APIエンドポイント

現在設定されているエンドポイント：

### 認証
- `POST /signup` - 新規ユーザー登録
- `POST /login` - ユーザーログイン

### 店舗情報
- `GET /salons/me` - 店舗情報取得
- `POST /salons` - 店舗情報登録・更新

### 投稿生成
- `POST /generate` - SNS投稿生成（60秒タイムアウト）

## 開発環境セットアップ

1. 依存関係のインストール：
```bash
npm install
```

2. 環境変数設定：
```bash
cp .env.example .env.local
# .env.local を編集してAPIのURLを設定
```

3. 開発サーバー起動：
```bash
npm run dev
```

## 機能

### 認証機能
- メールアドレス + パスワードでの会員登録
- httpOnly CookieによるJWT認証
- 自動ログイン状態管理

### 店舗情報管理
- 店舗名、住所、強み、サービス内容の登録
- 既存情報の編集・更新

### SNS投稿生成
- 複数チャネル対応（Instagram、X、Facebook、LINE）
- トーン設定（フレンドリー、プロフェッショナル等）
- AIへの追加要望入力
- リアルタイム編集機能
- ワンクリックコピー機能

## デプロイ

### Vercelへのデプロイ手順

#### 1. Vercelアカウントの準備
- [Vercel](https://vercel.com) にアカウント作成・ログイン
- GitHubアカウントと連携

#### 2. プロジェクトのデプロイ
1. Vercelダッシュボードで「New Project」をクリック
2. このリポジトリを選択
3. 以下の設定を確認：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 3. 環境変数の設定
Vercelの「Environment Variables」セクションで以下を設定：

```
Name: VITE_API_URL
Value: https://your-ngrok-url.ngrok.io
```

または本番APIサーバーのURL：
```
Name: VITE_API_URL
Value: https://your-backend-api.render.com
```

#### 4. デプロイ実行
- 「Deploy」ボタンをクリック
- 数分でデプロイ完了
- 提供されるURLでアプリケーションにアクセス可能

#### 5. 自動デプロイの設定
- GitHubにプッシュすると自動的に再デプロイされます
- プレビューデプロイ（プルリクエスト用）も自動生成されます

### 環境変数の設定例

**開発環境**:
```
VITE_API_URL=http://localhost:8000
```

**本番環境**:
```
VITE_API_URL=https://your-backend.render.com
```

**ngrokテスト環境**:
```
VITE_API_URL=https://abc123.ngrok.io
```

### Vercel CLI を使用したデプロイ（オプション）

```bash
# Vercel CLI のインストール
npm i -g vercel

# ログイン
vercel login

# デプロイ
vercel

# 本番環境にデプロイ
vercel --prod
```

## トラブルシューティング

### CORS エラー
バックエンドでフロントエンドのドメインを許可する必要があります。

### Cookie が送信されない
`credentials: 'include'` が設定されていることを確認してください。

### API接続エラー
1. 環境変数 `VITE_API_URL` が正しく設定されているか確認
2. バックエンドサーバーが起動しているか確認
3. ネットワーク接続を確認