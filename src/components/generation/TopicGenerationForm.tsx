import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { apiClient } from '../../utils/api';
import { ArrowLeft, Edit2, Check } from 'lucide-react';

interface TopicGenerationFormProps {
  onGenerate: (topic: string) => void;
  onBackToSalonInfo: () => void;
}

const TOPIC_SUGGESTIONS = [
  { id: 'seasonal', name: '季節ネタ', description: '春夏秋冬の季節に合わせた投稿' },
  { id: 'current_events', name: '時事ネタ', description: '最新のニュースや話題を取り入れた投稿' },
  { id: 'trend', name: 'トレンド', description: '流行のヘアスタイルや美容トレンド' },
  { id: 'middle_aged', name: '中年向け', description: '30-50代のお客様に向けた投稿' },
  { id: 'elderly', name: '年配向け', description: '50代以上のお客様に向けた投稿' },
  { id: 'salon_pr', name: '店舗PR重視', description: 'サロンの魅力や特徴をアピール' },
  { id: 'daily_talk', name: '日常呟き', description: 'カジュアルで親しみやすい日常の話題' },
];

interface TopicResult {
  summary: string;
  context: string;
}

export const TopicGenerationForm: React.FC<TopicGenerationFormProps> = ({ onGenerate, onBackToSalonInfo }) => {
  const [context, setContext] = useState('');
  const [selectedTopicSuggestion, setSelectedTopicSuggestion] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState<TopicResult[]>([]);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showResults, setShowResults] = useState(false);

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
      
      if (response.results && response.results.length > 0) {
        console.log('✅ Topics generated successfully:', response.results);
        setGeneratedTopics(response.results);
        setSelectedTopicIndex(0); // デフォルトで1番目を選択
        setShowResults(true);
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
      const mockTopics: TopicResult[] = [
        { 
          summary: "秋のヘアカラー提案",
          context: `【テストモード1】${context || '投稿ネタを生成しました'}\n\n※ APIエラーのため、モックデータを表示しています。` 
        },
        { 
          summary: "乾燥対策ヘアケア",
          context: `【テストモード2】別のアプローチでの投稿ネタです。` 
        },
        { 
          summary: "トレンドカット",
          context: `【テストモード3】さらに違った角度からの投稿ネタです。` 
        },
      ];
      setGeneratedTopics(mockTopics);
      setSelectedTopicIndex(0);
      setShowResults(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditingText(generatedTopics[index].context);
  };

  const handleEditSave = () => {
    if (editingIndex !== null) {
      const updatedTopics = [...generatedTopics];
      updatedTopics[editingIndex] = { context: editingText };
      setGeneratedTopics(updatedTopics);
      setEditingIndex(null);
      setEditingText('');
    }
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  const handleProceedToPostGeneration = () => {
    const selectedTopic = generatedTopics[selectedTopicIndex];
    onGenerate(selectedTopic.context);
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setGeneratedTopics([]);
    setSelectedTopicIndex(0);
  };

  if (showResults) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToForm}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            条件を変更
          </Button>
        </div>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">投稿ネタが生成されました</h2>
          <p className="text-gray-600">お気に入りのネタを選択して、必要に応じて編集してください</p>
        </div>

        <div className="space-y-4 mb-6">
          {generatedTopics.map((topic, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="selectedTopic"
                    checked={selectedTopicIndex === index}
                    onChange={() => setSelectedTopicIndex(index)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {topic.summary}
                    </h3>
                    <p className="text-sm text-gray-500">ネタ {index + 1}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditStart(index)}
                  disabled={editingIndex === index}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  編集
                </Button>
              </div>

              {editingIndex === index ? (
                <div className="space-y-3">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleEditSave}>
                      <Check className="w-4 h-4 mr-1" />
                      保存
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleEditCancel}>
                      キャンセル
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={`bg-gray-50 rounded-lg p-4 ${selectedTopicIndex === index ? 'ring-2 ring-purple-500' : ''}`}>
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {topic.context}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleProceedToPostGeneration}
          className="w-full"
          size="lg"
          disabled={editingIndex !== null}
        >
          選択したネタで投稿を生成する
        </Button>
      </Card>
    );
  }

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