import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { apiClient } from '../../utils/api';
import { ArrowLeft } from 'lucide-react';

interface TopicGenerationFormProps {
  onGenerate: (topic: string) => void;
  onBackToSalonInfo: () => void;
}

const TOPIC_SUGGESTIONS = [
  { id: 'seasonal', name: '季節ネタ', description: '季節に合わせた投稿内容' },
  { id: 'current_events', name: '時事ネタ', description: '最新の話題やニュース' },
  { id: 'trend', name: 'トレンド', description: '流行りのスタイルや技術' },
  { id: 'middle_aged', name: '中年向け', description: '30-50代向けの内容' },
  { id: 'elderly', name: '年配向け', description: '50代以上向けの内容' },
  { id: 'salon_pr', name: '店舗PR重視', description: '店舗の魅力をアピール' },
  { id: 'daily_talk', name: '日常呟き', description: 'カジュアルな日常の話題' },
];

export const TopicGenerationForm: React.FC<TopicGenerationFormProps> = ({ onGenerate, onBackToSalonInfo }) => {
  const [context, setContext] = useState('');
  const [selectedTopicSuggestion, setSelectedTopicSuggestion] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTopicSuggestionChange = (topicId: string) => {
    setSelectedTopicSuggestion(prev => prev === topicId ? '' : topicId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsGenerating(true);

    try {
      console.log('🎯 Generating topic with params:', {
        context,
        topic_suggestion: selectedTopicSuggestion,
      });

      const response = await apiClient.generateTopic({
        context,
        topic_suggestion: selectedTopicSuggestion,
      });
      
      if (response.context) {
        console.log('✅ Topic generated successfully:', response.context);
        onGenerate(response.context);
      } else {
        throw new Error('投稿ネタの生成に失敗しました');
      }
    } catch (error) {
      console.error('❌ Topic generation failed:', error);
      
      let errorMessage = '投稿ネタ生成に失敗しました';
      let debugInfo = '';
      
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          debugInfo = JSON.stringify(errorData, null, 2);
          
          if (errorData.response?.data?.message) {
            errorMessage = `生成失敗: ${errorData.response.data.message}`;
          } else if (errorData.response?.status === 401) {
            errorMessage = '認証エラー: ログインし直してください';
          } else if (errorData.response?.status >= 500) {
            errorMessage = `サーバーエラー (${errorData.response.status}): サーバーで問題が発生しました`;
          } else if (errorData.error === 'Network Error') {
            errorMessage = `ネットワークエラー: ${errorData.message}`;
          }
        } catch {
          errorMessage = `生成失敗: ${error.message}`;
          debugInfo = error.message;
        }
      }
      
      const fullErrorMessage = debugInfo 
        ? `${errorMessage}\n\nデバッグ情報:\n${debugInfo}`
        : errorMessage;
      
      alert(fullErrorMessage);
      
      // エラー時はモックデータで代用（開発用）
      const mockTopic = `【テストモード】${context || '投稿ネタを生成しました'}\n\n※ APIエラーのため、モックデータを表示しています。`;
      onGenerate(mockTopic);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToSalonInfo}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          店舗情報を編集
        </Button>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">投稿ネタを生成</h2>
        <p className="text-gray-600">投稿したい内容や方向性を設定して、投稿ネタを生成しましょう</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
            投稿したいこと、素案
          </label>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="例: 新しいヘアカラーのキャンペーンを開始します。春らしいピンクベージュが人気です。"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            投稿ネタに困ったら
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TOPIC_SUGGESTIONS.map(topic => (
              <div key={topic.id} className="relative">
                <label className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="topic_suggestion"
                    className="mt-1 mr-3"
                    checked={selectedTopicSuggestion === topic.id}
                    onChange={() => handleTopicSuggestionChange(topic.id)}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{topic.name}</div>
                    <div className="text-sm text-gray-600">{topic.description}</div>
                  </div>
                </label>
              </div>
            ))}
            <div className="relative">
              <label className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="topic_suggestion"
                  className="mt-1 mr-3"
                  checked={selectedTopicSuggestion === ''}
                  onChange={() => setSelectedTopicSuggestion('')}
                />
                <div>
                  <div className="font-medium text-gray-900">選択しない</div>
                  <div className="text-sm text-gray-600">素案のみで生成</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isGenerating}
        >
          {isGenerating ? '投稿ネタを生成中...' : '投稿ネタを生成する'}
        </Button>
      </form>
    </Card>
  );
};