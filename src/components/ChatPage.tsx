// components/ChatPage.tsx
// ...ver4の正しい内容をここに挿入...
// components/ChatPage.tsx (Now primarily the Chat List Screen)
import React, { useState, useRef, useEffect } from 'react';
import { ChatThread, ChatMessage } from '../types';
import { Send, Paperclip, Image, File, MoreVertical, Search, Users, MessageCircle, Hash } from 'lucide-react';

interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string;
  size?: number;
}

interface ChatPageProps {
  onBack: () => void;
  chatThreads: ChatThread[];
  chatMessages: { [threadId: string]: ChatMessage[] };
  onAddChatThread: (newThread: ChatThread, initialMessage?: ChatMessage, shouldNavigate?: boolean) => void;
  onSendMessage: (threadId: string, message: ChatMessage) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ onBack, chatThreads, chatMessages, onAddChatThread, onSendMessage }) => {
  // プロパティから受け取ったchatThreadsを使用
  const threads = chatThreads;

  // プロパティから受け取ったchatMessagesを使用
  const [selectedThreadId, setSelectedThreadId] = useState<string>('');
  const messages = selectedThreadId ? (chatMessages[selectedThreadId] || []) : [];

  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(threads.length > 0 ? threads[0] : null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // チャットタイプの表示設定
  const getThreadDisplayInfo = (thread: ChatThread) => {
    if (thread.isGroupChat) {
      return { icon: Hash, color: 'bg-green-500', label: 'グループ' };
    } else {
      return { icon: MessageCircle, color: 'bg-blue-500', label: '個人' };
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedThread) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId: selectedThread.id,
      senderId: 'currentUser',
      senderName: 'あなた',
      text: newMessage,
      timestamp: new Date(),
      isRead: false,
    };

    onSendMessage(selectedThread.id, message);
    setNewMessage('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedThread) return;

    Array.from(files).forEach(file => {
      const attachment: ChatAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(file),
        size: file.size,
      };

      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        threadId: selectedThread.id,
        senderId: 'currentUser',
        senderName: 'あなた',
        text: `ファイルを送信しました: ${file.name}`,
        timestamp: new Date(),
        isRead: false,
      };

      onSendMessage(selectedThread.id, message);
    });

    setShowFileUpload(false);
  };

  const handleThreadSelect = (thread: ChatThread) => {
    setSelectedThread(thread);
    setSelectedThreadId(thread.id);
  };

  const filteredThreads = threads.filter(thread => {
    const threadName = thread.groupName || thread.participants.map(p => p.name).join(', ');
    return threadName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-slate-900 text-white rounded-lg shadow-xl">
        <div className="flex h-[600px]">
          {/* サイドバー - スレッド一覧 */}
          <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
            {/* ヘッダー */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold text-sky-400">チャット</h1>
                <button
                  onClick={onBack}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  戻る
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="スレッドを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
              </div>
            </div>

            {/* スレッド一覧 */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {filteredThreads.map(thread => {
                const typeInfo = getThreadDisplayInfo(thread);
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleThreadSelect(thread)}
                    className={`p-4 border-b border-slate-700 cursor-pointer transition-colors ${
                      selectedThread?.id === thread.id ? 'bg-slate-700' : 'hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full ${typeInfo.color} flex items-center justify-center text-white font-semibold`}>
                          {thread.isGroupChat ? 'G' : 'P'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-white truncate">
                            {thread.groupName || thread.participants.map(p => p.name).join(', ')}
                          </h3>
                          {thread.lastMessage?.timestamp && (
                            <span className="text-xs text-slate-400 flex-shrink-0">
                              {formatTime(thread.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        {thread.lastMessage && (
                          <p className="text-sm text-slate-400 truncate mt-1">
                            {thread.lastMessage.text}
                          </p>
                        )}
                      </div>
                      {(thread.unreadCount || 0) > 0 && (
                        <div className="bg-sky-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {thread.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* メイン - チャットエリア */}
          <div className="flex-1 flex flex-col h-full min-h-0">
            {selectedThread ? (
              <>
                {/* チャットヘッダー */}
                <div className="p-4 border-b border-slate-700 bg-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getThreadDisplayInfo(selectedThread).color} flex items-center justify-center text-white font-semibold`}>
                      {selectedThread.isGroupChat ? 'G' : 'P'}
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">
                        {selectedThread.groupName || selectedThread.participants.map(p => p.name).join(', ')}
                      </h2>
                      <p className="text-sm text-slate-400">
                        {getThreadDisplayInfo(selectedThread).label} • {selectedThread.participants.length}人
                      </p>
                    </div>
                    <button className="ml-auto p-2 text-slate-400 hover:text-white transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* メッセージエリア */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.senderId === 'currentUser' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm">
                        {message.senderName.charAt(0)}
                      </div>
                      <div className={`max-w-xs lg:max-w-md ${
                        message.senderId === 'currentUser' ? 'text-right' : ''
                      }`}>
                        <div className={`rounded-lg px-4 py-2 ${
                          message.senderId === 'currentUser'
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-700 text-white'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">
                            {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.senderId === 'currentUser' && (
                            <span className="text-xs text-slate-400">
                              {message.isRead ? '既読' : '未読'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* メッセージ入力エリア */}
                <div className="p-4 border-t border-slate-700 bg-slate-800">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFileUpload(!showFileUpload)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="メッセージを入力..."
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>

                  {/* ファイルアップロード */}
                  {showFileUpload && (
                    <div className="mt-2 p-3 bg-slate-700 rounded-lg">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-600"
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center min-h-0">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">チャットを選択</h3>
                  <p className="text-slate-400">左側のスレッドからチャットを選択してください</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};