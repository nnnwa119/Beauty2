import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { GeneratedResult } from '../../types';
import { apiClient } from '../../utils/api';
import { ArrowLeft } from 'lucide-react';

interface PostGenerationFormProps {
  generatedTopic: string;
  onGenerate: (results: GeneratedResult[]) => void;
  onBackToTopicGeneration: () => void;
}

const CHANNELS = [
  { id: 'instagram', name: 'Instagram', description: 'ハッシュタグ重視、視覚的な投稿' },
  { id: 'threads', name: 'Threads', description: '短文、リアルタイム性重視' },
  { id: 'facebook', name: 'Facebook', description: '詳細な説明、コミュニティ感重視' },
  { id: 'line', name: 'LINE', description: '親しみやすい口調、お客様向け' },
];

const TONES = [
  { id: 'friendly', name: 'フレンドリー', description: '親しみやすく温かい印象' },
  { id: 'professional', name: 'プロフェッショナル', description: '信頼感のある専門的な印象' },
  { id: 'trendy', name: 'トレンディ', description: '最新のトレンドを意識した印象' },
  { id: 'elegant', name: 'エレガント', description: '上品で洗練された印象' },
];

export const PostGenerationForm: React.FC<PostGenerationFormProps> = ({ 
  generatedTopic, 
  onGenerate, 
  onBackToTopicGeneration 
}) => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['instagram']);
  const [selectedTone, setSelectedTone] = useState('friendly');
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
    
    if (selectedChannels.length === 0) {
      return;
    }
    
    setIsGenerating(true);

    try {
      console.log('📝 Generating posts with params:', {
        gen_context: generatedTopic,
        channels: selectedChannels,
        tone: selectedTone,
      });

      const response = await apiClient.generatePosts({
        gen_context: generatedTopic,
        channels: selectedChannels,
        tone: selectedTone,
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
      const mockResults: GeneratedResult[] = selectedChannels.map(channelId => {
        const channel = CHANNELS.find(c => c.id === channelId);
        return {
          channel: channelId,
          outputs: [{
            text: `【${channel?.name}用投稿 - テストモード】\n\n${generatedTopic}\n\n※ APIエラーのため、モックデータを表示しています。`,
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
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToTopicGeneration}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          投稿ネタを編集
        </Button>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">投稿を生成</h2>
        <p className="text-gray-600">生成されたネタを各チャネル・トーンに合わせて投稿文を作成します</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">生成されたネタ</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-800 whitespace-pre-wrap">{generatedTopic}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isGenerating}
          disabled={selectedChannels.length === 0}
        >
          {isGenerating ? '投稿を生成中...' : '投稿を生成する'}
        </Button>
      </form>
    </Card>
  );
};