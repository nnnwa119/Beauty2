import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { Scissors } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/salonlight.png" 
              alt="SalonLight Logo" 
              className="w-16 h-16 rounded-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SalonLight
          </h1>
          <p className="text-gray-600">
            美容室向けSNS投稿生成サービス
          </p>
        </div>

        {isLogin ? (
          <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};