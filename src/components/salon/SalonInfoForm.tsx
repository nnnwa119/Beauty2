import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { apiClient } from '../../utils/api';
import { SalonInfo } from '../../types';

interface SalonInfoFormProps {
  onComplete: () => void;
}

export const SalonInfoForm: React.FC<SalonInfoFormProps> = ({ onComplete }) => {
  const [salonInfo, setSalonInfo] = useState<SalonInfo>({
    name: '',
    location: '',
    strengths: '',
    services: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // 既存の店舗情報を取得
    const fetchSalonInfo = async () => {
      try {
        const data = await apiClient.getSalonInfo();
        if (data) {
          setSalonInfo(data);
        }
      } catch (err) {
        // 店舗情報がない場合はエラーを無視
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchSalonInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('💾 Saving salon info:', salonInfo);

    try {
      await apiClient.updateSalonInfo(salonInfo);
      console.log('✅ Salon info saved successfully');
      onComplete();
    } catch (err) {
      console.error('❌ Failed to save salon info:', err);
      
      let errorMessage = '店舗情報の保存に失敗しました';
      let debugInfo = '';
      
      if (err instanceof Error) {
        try {
          const errorData = JSON.parse(err.message);
          debugInfo = JSON.stringify(errorData, null, 2);
          
          if (errorData.response?.data?.message) {
            errorMessage = `保存失敗: ${errorData.response.data.message}`;
          } else if (errorData.response?.status === 401) {
            errorMessage = '認証エラー: ログインし直してください';
          } else if (errorData.response?.status) {
            errorMessage = `サーバーエラー (${errorData.response.status}): ${errorData.response.statusText}`;
          }
        } catch {
          errorMessage = `保存失敗: ${err.message}`;
          debugInfo = err.message;
        }
      }
      
      setError(`${errorMessage}\n\nデバッグ情報:\n${debugInfo}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof SalonInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSalonInfo(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">店舗情報</h2>
          <p className="text-gray-600">
            投稿生成に必要な店舗情報を入力してください<br />
            空欄で進むこともできます
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="name"
            label="店舗名"
            value={salonInfo.name}
            onChange={handleChange('name')}
            placeholder="例: Hair Salon BEAUTY"
          />

          <Input
            id="location"
            label="住所"
            value={salonInfo.location}
            onChange={handleChange('location')}
            placeholder="例: 東京都渋谷区○○1-2-3"
          />

          <div>
            <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-1">
              店舗の強み・特徴
            </label>
            <textarea
              id="strengths"
              value={salonInfo.strengths}
              onChange={handleChange('strengths')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="例: カット・カラーが得意、オーガニック商品使用、個室対応など"
            />
          </div>

          <div>
            <label htmlFor="services" className="block text-sm font-medium text-gray-700 mb-1">
              提供サービス
            </label>
            <textarea
              id="services"
              value={salonInfo.services}
              onChange={handleChange('services')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="例: カット、カラー、パーマ、トリートメント、ヘッドスパなど"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
          >
            保存して次に進む
          </Button>
        </form>
      </Card>
    </div>
  );
};