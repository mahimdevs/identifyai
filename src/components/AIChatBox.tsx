import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Loader2, Sparkles, User, Bot, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatBoxProps {
  context: {
    name: string;
    category: string;
    attributes: { label: string; value: string }[];
    details: { title: string; content: string }[];
    tips: string[];
  };
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-ai`;

// Parse and render formatted AI content
const FormattedContent = ({ content }: { content: string }) => {
  if (!content) {
    return (
      <span className="flex items-center gap-2 text-white/50">
        <Loader2 className="w-4 h-4 animate-spin" />
        Thinking...
      </span>
    );
  }

  // Split content into lines for processing
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: string[] = [];
  let numberedItems: string[] = [];
  let currentIndex = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${currentIndex}`} className="space-y-2 my-3">
          {listItems.map((item, i) => (
            <motion.li 
              key={i} 
              className="flex items-start gap-2"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <span className="text-white/85">{formatInlineText(item)}</span>
            </motion.li>
          ))}
        </ul>
      );
      listItems = [];
      currentIndex++;
    }
  };

  const flushNumberedList = () => {
    if (numberedItems.length > 0) {
      elements.push(
        <ol key={`ol-${currentIndex}`} className="space-y-2 my-3">
          {numberedItems.map((item, i) => (
            <motion.li 
              key={i} 
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                {i + 1}
              </span>
              <span className="text-white/85 pt-0.5">{formatInlineText(item)}</span>
            </motion.li>
          ))}
        </ol>
      );
      numberedItems = [];
      currentIndex++;
    }
  };

  // Format inline text (bold, italic, code)
  const formatInlineText = (text: string): JSX.Element => {
    // Handle **bold**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
      <>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
          }
          // Handle `code`
          const codeParts = part.split(/(`[^`]+`)/g);
          return codeParts.map((codePart, j) => {
            if (codePart.startsWith('`') && codePart.endsWith('`')) {
              return (
                <code key={`${i}-${j}`} className="px-1.5 py-0.5 rounded bg-white/10 text-blue-300 text-xs font-mono">
                  {codePart.slice(1, -1)}
                </code>
              );
            }
            return <span key={`${i}-${j}`}>{codePart}</span>;
          });
        })}
      </>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Empty line - flush lists and add spacing
    if (!line) {
      flushList();
      flushNumberedList();
      continue;
    }

    // Headers (## or ###)
    if (line.startsWith('### ')) {
      flushList();
      flushNumberedList();
      elements.push(
        <h4 key={`h4-${currentIndex}`} className="text-sm font-bold text-white mt-4 mb-2 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-blue-400" />
          {line.slice(4)}
        </h4>
      );
      currentIndex++;
      continue;
    }

    if (line.startsWith('## ')) {
      flushList();
      flushNumberedList();
      elements.push(
        <h3 key={`h3-${currentIndex}`} className="text-base font-bold text-white mt-4 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          {line.slice(3)}
        </h3>
      );
      currentIndex++;
      continue;
    }

    // Bullet list items (- or •)
    if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
      flushNumberedList();
      listItems.push(line.slice(2));
      continue;
    }

    // Numbered list items (1. 2. etc)
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      flushList();
      numberedItems.push(numberedMatch[2]);
      continue;
    }

    // Check for special callout patterns
    if (line.toLowerCase().startsWith('tip:') || line.toLowerCase().startsWith('💡')) {
      flushList();
      flushNumberedList();
      elements.push(
        <div key={`tip-${currentIndex}`} className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 my-2">
          <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <span className="text-amber-200/90 text-sm">{line.replace(/^(tip:|💡)\s*/i, '')}</span>
        </div>
      );
      currentIndex++;
      continue;
    }

    if (line.toLowerCase().startsWith('warning:') || line.toLowerCase().startsWith('⚠️')) {
      flushList();
      flushNumberedList();
      elements.push(
        <div key={`warn-${currentIndex}`} className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 my-2">
          <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
          <span className="text-rose-200/90 text-sm">{line.replace(/^(warning:|⚠️)\s*/i, '')}</span>
        </div>
      );
      currentIndex++;
      continue;
    }

    if (line.toLowerCase().startsWith('note:') || line.toLowerCase().startsWith('✅')) {
      flushList();
      flushNumberedList();
      elements.push(
        <div key={`note-${currentIndex}`} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 my-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <span className="text-emerald-200/90 text-sm">{line.replace(/^(note:|✅)\s*/i, '')}</span>
        </div>
      );
      currentIndex++;
      continue;
    }

    // Regular paragraph
    flushList();
    flushNumberedList();
    elements.push(
      <p key={`p-${currentIndex}`} className="text-white/85 leading-relaxed my-2">
        {formatInlineText(line)}
      </p>
    );
    currentIndex++;
  }

  // Flush remaining lists
  flushList();
  flushNumberedList();

  return <div className="space-y-1">{elements}</div>;
};

const AIChatBox = ({ context }: AIChatBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      // Add initial assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === 'assistant') {
                  lastMessage.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      // Remove the empty assistant message if there was an error
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    `Tell me more about ${context.name}`,
    'Is this healthy?',
    'What are the benefits?',
    'Any safety concerns?',
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full p-5 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-400/25 backdrop-blur-xl flex items-center gap-4 group",
          isOpen && "hidden"
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <motion.div 
          className="w-12 h-12 rounded-2xl bg-blue-500/25 flex items-center justify-center shadow-lg shadow-blue-500/20"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MessageCircle className="w-6 h-6 text-blue-400" />
        </motion.div>
        <div className="text-left flex-1">
          <span className="font-bold text-white text-base block">Chat with AI</span>
          <span className="text-white/50 text-xs">Ask anything about this item</span>
        </div>
        <Sparkles className="w-5 h-5 text-blue-400" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="fixed inset-x-4 bottom-4 top-24 z-[60] rounded-3xl bg-black/95 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-transparent">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 flex items-center justify-center shadow-lg shadow-blue-500/20"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bot className="w-5 h-5 text-blue-400" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    AI Assistant
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-white/50 text-xs">Ask about {context.name}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10"
              >
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <motion.div 
                    className="text-center py-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Sparkles className="w-8 h-8 text-blue-400" />
                    </motion.div>
                    <p className="text-white/70 text-sm">
                      Hi! Ask me anything about
                    </p>
                    <p className="text-white font-semibold text-lg">{context.name}</p>
                  </motion.div>
                  <div className="space-y-2">
                    <p className="text-white/40 text-xs uppercase tracking-wide px-2 flex items-center gap-2">
                      <span className="w-4 h-px bg-white/20" />
                      Suggested questions
                      <span className="flex-1 h-px bg-white/20" />
                    </p>
                    {suggestedQuestions.map((q, i) => (
                      <motion.button
                        key={i}
                        onClick={() => {
                          setInput(q);
                          inputRef.current?.focus();
                        }}
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all group"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ x: 4 }}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/30 transition-colors">
                            <MessageCircle className="w-3 h-3 text-blue-400" />
                          </span>
                          {q}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className={cn(
                      "flex gap-3",
                      msg.role === 'user' && "flex-row-reverse"
                    )}
                  >
                    <motion.div 
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                        msg.role === 'user' 
                          ? "bg-gradient-to-br from-primary/30 to-primary/10" 
                          : "bg-gradient-to-br from-blue-500/30 to-cyan-500/10"
                      )}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-primary" />
                      ) : (
                        <Bot className="w-4 h-4 text-blue-400" />
                      )}
                    </motion.div>
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-sm",
                      msg.role === 'user' 
                        ? "bg-primary/20 text-white rounded-tr-md border border-primary/30" 
                        : "bg-white/5 rounded-tl-md border border-white/10"
                    )}>
                      {msg.role === 'user' ? (
                        <span className="text-white">{msg.content}</span>
                      ) : (
                        <FormattedContent content={msg.content} />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 transition-all"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatBox;
