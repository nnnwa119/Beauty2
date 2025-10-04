import React, { useState } from 'react';
import { Header } from '../layout/Header';
import { SalonInfoForm } from '../salon/SalonInfoForm';
import { TopicGenerationForm } from '../generation/TopicGenerationForm';
import { PostGenerationForm } from '../generation/PostGenerationForm';
import { PostCard } from '../generation/PostCard';
import { GeneratedResult } from '../../types';
import { Sparkles } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [step, setStep] = useState<'salon-info' | 'topic-generation' | 'post-generation' | 'results'>('salon-info');
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>([]);
  const [generatedTopic, setGeneratedTopic] = useState<string>('');

  const handleSalonInfoComplete = () => {
    setStep('topic-generation');
  };

  const handleTopicGeneration = (topic: string) => {
    setGeneratedTopic(topic);
    setStep('post-generation');
  };

  const handlePostGeneration = (results: GeneratedResult[]) => {
    setGeneratedResults(results);
    setStep('results');
  };

  const handleEditPost = (channel: string, newContent: string) => {
    setGeneratedResults(prev =>
      prev.map(result =>
        result.channel === channel 
          ? { ...result, outputs: [{ text: newContent }] }
          : result
      )
    );
  };

  const handleNewTopicGeneration = () => {
    setStep('topic-generation');
  };

  const handleBackToTopicGeneration = () => {
    setStep('topic-generation');
  };

  const handleBackToSalonInfo = () => {
    setStep('salon-info');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        {step === 'salon-info' && (
          <SalonInfoForm onComplete={handleSalonInfoComplete} />
        )}

        {step === 'topic-generation' && (
          <div className="max-w-4xl mx-auto px-4">
            <TopicGenerationForm 
              onGenerate={handleTopicGeneration} 
              onBackToSalonInfo={handleBackToSalonInfo}
            />
          </div>
        )}

        {step === 'post-generation' && (
          <div className="max-w-4xl mx-auto px-4">
            <PostGenerationForm 
              generatedTopic={generatedTopic}
              onGenerate={handlePostGeneration}
              onBackToTopicGeneration={handleBackToTopicGeneration}
            />
          </div>
        )}

        {step === 'results' && (
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                投稿が生成されました！
              </h2>
              <p className="text-gray-600 mb-6">
                各チャネル向けに最適化された投稿内容をご確認ください
              </p>
              <button
                onClick={handleNewTopicGeneration}
                className="text-orange-600 hover:text-orange-700 font-medium underline"
              >
                新しいネタを生成する
              </button>
              <span className="mx-2 text-gray-400">|</span>
              <button
                onClick={handleBackToSalonInfo}
                className="text-orange-600 hover:text-orange-700 font-medium underline"
              >
                店舗情報を編集
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {generatedResults.map((result, index) => (
                <PostCard
                  key={index}
                  result={result}
                  onEdit={handleEditPost}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};