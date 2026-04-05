
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, TEAMS, User } from '../types';

interface ChatViewProps {
  boardId: string;
  currentUser: User | null;
}

const ChatView: React.FC<ChatViewProps> = ({ boardId, currentUser }) => {
  const [activeChannel, setActiveChannel] = useState<string>('General');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = ['General', ...TEAMS];

  // Load messages from localStorage
  useEffect(() => {
    const loadMessages = () => {
      try {
        const savedMessages = localStorage.getItem('syncSpaceChatMessages');
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          // Filter for current board
          setMessages(parsed.filter((m: ChatMessage) => m.boardId === boardId));
        }
      } catch (error) {
        console.error("Failed to load messages", error);
      }
    };

    loadMessages();
    
    // Poll for "real-time" updates from other tabs/simulated users
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [boardId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      boardId,
      channel: activeChannel,
      senderId: currentUser.id,
      senderName: currentUser.username,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    
    // Persist to all messages in storage
    const allSavedMessages = JSON.parse(localStorage.getItem('syncSpaceChatMessages') || '[]');
    localStorage.setItem('syncSpaceChatMessages', JSON.stringify([...allSavedMessages, message]));

    setNewMessage('');
  };

  const filteredMessages = messages.filter(m => m.channel === activeChannel);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-full bg-white dark:bg-[#161B22] rounded-lg shadow-sm border border-slate-200 dark:border-[#30363D] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-50 dark:bg-[#0D1117] border-r border-slate-200 dark:border-[#30363D] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-[#30363D]">
          <h3 className="font-bold text-slate-700 dark:text-slate-200">Channels</h3>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.map(channel => (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeChannel === channel
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#21262D]'
              }`}
            >
              <span className="opacity-50 mr-2 text-lg">#</span>
              {channel}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#161B22]">
        {/* Chat Header */}
        <header className="h-14 border-b border-slate-200 dark:border-[#30363D] flex items-center px-6 flex-shrink-0">
          <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
            <span className="text-slate-400 mr-1">#</span> {activeChannel}
          </div>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="w-16 h-16 bg-slate-100 dark:bg-[#0D1117] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p>This is the start of the <span className="font-bold">#{activeChannel}</span> channel.</p>
            </div>
          ) : (
            filteredMessages.map((msg, index) => {
              const isMe = msg.senderId === currentUser?.id;
              const showHeader = index === 0 || filteredMessages[index - 1].senderId !== msg.senderId;

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                   {!isMe && showHeader && (
                     <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded bg-purple-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                           {msg.senderName.substring(0,2)}
                        </div>
                     </div>
                   )}
                   {isMe && showHeader && <div className="w-8 h-8 mr-3 invisible" />} {/* Spacer for alignment */}
                   
                   <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      {showHeader && (
                          <div className="flex items-baseline mb-1 space-x-2">
                              {!isMe && <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{msg.senderName}</span>}
                              <span className="text-xs text-slate-400">{formatTime(msg.timestamp)}</span>
                          </div>
                      )}
                      <div className={`px-4 py-2 rounded-lg shadow-sm text-sm leading-relaxed break-words
                          ${isMe 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-slate-100 dark:bg-[#21262D] text-slate-800 dark:text-slate-200 rounded-tl-none'
                          }
                      `}>
                          {msg.content}
                      </div>
                   </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#0D1117]">
          <form onSubmit={handleSendMessage} className="relative rounded-lg shadow-sm border border-slate-300 dark:border-[#30363D] bg-white dark:bg-[#161B22] focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${activeChannel}`}
              className="block w-full border-0 bg-transparent py-3 pl-4 pr-12 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0 sm:text-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
            >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
               </svg>
            </button>
          </form>
          <p className="text-xs text-slate-400 mt-2 text-center">
             <strong>Return</strong> to send
          </p>
        </div>
      </main>
    </div>
  );
};

export default ChatView;
