import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { LoginResponse } from '../../types';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setDebugInfo('ログイン処理を開始...');

    try {
      const response = await apiClient.login(email, password);
      setDebugInfo(`API応答受信: ${JSON.stringify(response, null, 2)}`);
      
      if ('error' in response && response.error) {
        setError(response.message || 'ログインに失敗しました');
        return;
      }

      if ('user_id' in response && 'email' in response) {
        setDebugInfo('ログイン成功、ユーザー情報を設定中...');
        
        // Cookieの確認
        setTimeout(() => {
          const cookies = document.cookie;
          console.log('🍪 Current cookies:', cookies);
          setDebugInfo(prev => prev + `\n\nCookies確認: ${cookies || 'No cookies found'}`);
        }, 1000);
        
        login({
          user_id: response.user_id,
          email: response.email,
        });
      } else {
        setDebugInfo(`予期しないレスポンス形式: ${JSON.stringify(response, null, 2)}`);
        setError('ログインに失敗しました');
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ログイン</h2>
        <p className="text-gray-600">アカウントにログインして投稿を生成しましょう</p>
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
          placeholder="パスワードを入力"
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
          ログイン
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          アカウントをお持ちでない方は{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-purple-600 hover:text-purple-700 font-medium underline"
          >
            新規登録
          </button>
        </p>
      </div>
    </Card>
  );
};