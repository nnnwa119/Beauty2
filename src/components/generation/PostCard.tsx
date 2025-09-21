import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Copy, Edit2, Check } from 'lucide-react';
import { GeneratedResult } from '../../types';

interface PostCardProps {
  result: GeneratedResult;
  onEdit: (channel: string, newContent: string) => void;
}

const CHANNEL_NAMES: Record<string, string> = {
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  facebook: 'Facebook',
  line: 'LINE',
};

export const PostCard: React.FC<PostCardProps> = ({ result, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // 投稿内容を結合（テキスト + ハッシュタグ）
  const getFullContent = () => {
    const output = result.outputs[0];
    if (!output) return '';
    
    let content = output.text;
    if (output.hashtags && output.hashtags.length > 0) {
      content += '\n\n' + output.hashtags.join(' ');
    }
    return content;
  };

  const fullContent = getFullContent();
  
  React.useEffect(() => {
    setEditContent(fullContent);
  }, [fullContent]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editContent : fullContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  const handleSaveEdit = () => {
    onEdit(result.channel, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(fullContent);
    setIsEditing(false);
  };

  return (
    <Card className="w-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{CHANNEL_NAMES[result.channel] || result.channel}</h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              編集
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  コピー済み
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  コピー
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
          />
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleSaveEdit}>
              保存
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
              キャンセル
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
            {fullContent}
          </pre>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        文字数: {fullContent.length}文字
      </div>
    </Card>
  );
};