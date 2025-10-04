import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const validateForm = () => {
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return false;
    }
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setDebugInfo('サインアップ処理を開始...');

    try {
      const response = await apiClient.signup(email, password);
      setDebugInfo(`API応答受信: ${JSON.stringify(response, null, 2)}`);
      
      // バックエンドからのレスポンス形式に合わせて修正
      if ('error' in response && response.error) {
        setError(response.message || '登録に失敗しました');
        return;
      }

      // サインアップが成功した場合、レスポンスにuser_idとemailが含まれる
      if ('user_id' in response && 'email' in response) {
        setDebugInfo('サインアップ成功、ユーザー情報を設定中...');
        login({
          user_id: response.user_id,
          email: response.email,
        });
      } else {
        // 予期しないレスポンス形式の場合
        setDebugInfo(`予期しないレスポンス形式: ${JSON.stringify(response, null, 2)}`);
        setError('登録は成功しましたが、ログインに失敗しました');
      }
    } catch (err) {
      let errorMessage = 'ネットワークエラーが発生しました。';
      let debugMessage = '';
      
      if (err instanceof Error) {
        try {
          // JSONエラー情報をパース
          const errorInfo = JSON.parse(err.message);
          debugMessage = JSON.stringify(errorInfo, null, 2);
          errorMessage = errorInfo.message || errorMessage;
        } catch {
          // 通常のエラーメッセージ
          errorMessage = err.message;
          debugMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setDebugInfo(`エラー詳細: ${debugMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">新規登録</h2>
        <p className="text-gray-600">アカウントを作成してサービスを利用しましょう</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          type="email"
          label="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="example@salon.com"
        />

        <Input
          id="password"
          type="password"
          label="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="8文字以上で入力"
          helperText="8文字以上で入力してください"
        />

        <Input
          id="confirmPassword"
          type="password"
          label="パスワード（確認）"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="パスワードを再入力"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {debugInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-xs font-mono whitespace-pre-wrap">{debugInfo}</p>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-gray-600 text-xs">
            API URL: {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
        >
          アカウントを作成
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          既にアカウントをお持ちの方は{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-orange-600 hover:text-orange-700 font-medium underline"
          >
            ログイン
          </button>
        </p>
      </div>
    </Card>
  );
};