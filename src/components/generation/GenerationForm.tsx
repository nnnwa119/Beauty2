import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { GeneratedResult } from '../../types';
import { apiClient } from '../../utils/api';

interface GenerationFormProps {
  onGenerate: (results: GeneratedResult[]) => void;
}

const CHANNELS = [
  { id: 'instagram', name: 'Instagram', description: 'ハッシュタグ重視、視覚的な投稿' },
  { id: 'twitter', name: 'X (Twitter)', description: '短文、リアルタイム性重視' },
  { id: 'facebook', name: 'Facebook', description: '詳細な説明、コミュニティ感重視' },
  { id: 'line', name: 'LINE', description: '親しみやすい口調、お客様向け' },
];

const TONES = [
  { id: 'friendly', name: 'フレンドリー', description: '親しみやすく温かい印象' },
  { id: 'professional', name: 'プロフェッショナル', description: '信頼感のある専門的な印象' },
  { id: 'trendy', name: 'トレンディ', description: '最新のトレンドを意識した印象' },
  { id: 'elegant', name: 'エレガント', description: '上品で洗練された印象' },
];

export const GenerationForm: React.FC<GenerationFormProps> = ({ onGenerate }) => {
  const [context, setContext] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['instagram']);
  const [selectedTone, setSelectedTone] = useState('friendly');
  const [hints, setHints] = useState('');
  const [askAi, setAskAi] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChannelChange = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedChannels.length === 0 || !context.trim()) {
      return;
    }
    
    setIsGenerating(true);

    try {
      console.log('🎨 Generating posts with params:', {
        context,
        channels: selectedChannels,
        tone: selectedTone,
        hints,
        ask_ai: askAi,
      });

      const response = await apiClient.generatePosts({
        context,
        channels: selectedChannels,
        tone: selectedTone,
        hints,
        ask_ai: askAi,
      });
      
      if (response.results) {
        console.log('✅ Posts generated successfully:', response.results);
        onGenerate(response.results);
      } else {
        throw new Error('投稿の生成に失敗しました');
      }
    } catch (error) {
      console.error('❌ Post generation failed:', error);
      
      let errorMessage = '投稿生成に失敗しました';
      let debugInfo = '';
      
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          debugInfo = JSON.stringify(errorData, null, 2);
          
          if (errorData.response?.data?.message) {
            errorMessage = `生成失敗: ${errorData.response.data.message}`;
          } else if (errorData.response?.status === 401) {
            errorMessage = '認証エラー: ログインし直してください';
          } else if (errorData.response?.status === 403) {
            errorMessage = 'アクセス権限がありません';
          } else if (errorData.response?.status >= 500) {
            errorMessage = `サーバーエラー (${errorData.response.status}): サーバーで問題が発生しました`;
          } else if (errorData.response?.status) {
            errorMessage = `サーバーエラー (${errorData.response.status}): ${errorData.response.statusText}`;
          } else if (errorData.error === 'Network Error') {
            errorMessage = `ネットワークエラー: ${errorData.message}`;
          }
        } catch {
          errorMessage = `生成失敗: ${error.message}`;
          debugInfo = error.message;
        }
      }
      
      // より詳細なエラー表示
      const fullErrorMessage = debugInfo 
        ? `${errorMessage}\n\nデバッグ情報:\n${debugInfo}`
        : errorMessage;
      
      alert(fullErrorMessage);
      
      // エラー時はモックデータで代用（開発用）
      const mockResults: GeneratedResult[] = selectedChannels.map(channelId => {
        const channel = CHANNELS.find(c => c.id === channelId);
        return {
          channel: channelId,
          outputs: [{
            text: `【${channel?.name}用投稿 - テストモード】\n\n${context}\n\n※ APIエラーのため、モックデータを表示しています。`,
            hashtags: channelId === 'instagram' ? ['#美容室', '#ヘアサロン', '#スタイル'] : undefined
          }]
        };
      });
      onGenerate(mockResults);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">投稿を生成</h2>
        <p className="text-gray-600">SNS投稿の内容を設定して、自動で投稿文を生成しましょう</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
            投稿内容・コンテキスト <span className="text-red-500">*</span>
          </label>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="例: 新しいヘアカラーのキャンペーンを開始します。春らしいピンクベージュが人気です。"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            投稿するチャネル <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CHANNELS.map(channel => (
              <div key={channel.id} className="relative">
                <label className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    className="mt-1 mr-3"
                    checked={selectedChannels.includes(channel.id)}
                    onChange={() => handleChannelChange(channel.id)}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{channel.name}</div>
                    <div className="text-sm text-gray-600">{channel.description}</div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            投稿のトーン <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TONES.map(tone => (
              <div key={tone.id} className="relative">
                <label className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="tone"
                    className="mt-1 mr-3"
                    checked={selectedTone === tone.id}
                    onChange={() => setSelectedTone(tone.id)}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{tone.name}</div>
                    <div className="text-sm text-gray-600">{tone.description}</div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="hints" className="block text-sm font-medium text-gray-700 mb-2">
            追加のヒント・要望
          </label>
          <textarea
            id="hints"
            value={hints}
            onChange={(e) => setHints(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="例: ハッシュタグを多めに、価格情報を含める、予約の案内を入れるなど"
          />
        </div>

        <div>
          <label htmlFor="askAi" className="block text-sm font-medium text-gray-700 mb-2">
            AIへの質問・相談
          </label>
          <textarea
            id="askAi"
            value={askAi}
            onChange={(e) => setAskAi(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="例: 春らしいハッシュタグのアイデアを教えて、効果的な投稿時間はいつですか？など"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isGenerating}
          disabled={selectedChannels.length === 0 || !context.trim()}
        >
          {isGenerating ? '投稿を生成中...' : '投稿を生成する'}
        </Button>
      </form>
    </Card>
  );
};