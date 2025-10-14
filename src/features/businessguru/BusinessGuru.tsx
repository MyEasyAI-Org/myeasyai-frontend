import { useState } from 'react';
import { MessageSquare, Send, Lightbulb, TrendingUp, Users, DollarSign, Target, Loader2 } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function BusinessGuru() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o Business Guru, seu assistente especializado em negócios. Como posso ajudar você hoje?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const quickTopics = [
    { icon: TrendingUp, label: 'Marketing Digital', color: 'blue' },
    { icon: DollarSign, label: 'Finanças', color: 'green' },
    { icon: Users, label: 'Gestão de Pessoas', color: 'purple' },
    { icon: Target, label: 'Estratégia', color: 'orange' },
  ];

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulação de resposta (aqui você conectaria com a API real)
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: `Entendo sua questão sobre "${inputMessage}". Vou te ajudar com isso! Para seu tipo de negócio, recomendo...`
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickTopic = (topic: string) => {
    setInputMessage(`Me ajude com ${topic}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black-main/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/bone-logo.png"
                alt="MyEasyAI Logo"
                className="h-12 w-12 object-contain"
              />
              <div>
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-xl font-bold text-transparent">
                  Business Guru
                </span>
                <p className="text-xs text-slate-400">Consultoria de Negócios com IA</p>
              </div>
            </div>
            <a
              href="/"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Voltar ao Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar - Quick Topics */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Lightbulb className="h-6 w-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Tópicos Rápidos</h2>
              </div>

              <div className="space-y-3">
                {quickTopics.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <button
                      key={topic.label}
                      onClick={() => handleQuickTopic(topic.label)}
                      className={`w-full flex items-center space-x-3 rounded-lg border border-slate-700 bg-slate-800 p-4 hover:border-${topic.color}-500 hover:bg-slate-700 transition-colors text-left`}
                    >
                      <Icon className={`h-5 w-5 text-${topic.color}-400`} />
                      <span className="text-white font-medium">{topic.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Suas Estatísticas</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-white">47</p>
                  <p className="text-sm text-slate-400">Consultas Realizadas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">12h</p>
                  <p className="text-sm text-slate-400">Tempo Economizado</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">8</p>
                  <p className="text-sm text-slate-400">Estratégias Implementadas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2">
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-slate-800 text-slate-100 border border-slate-700'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-green-400" />
                          <span className="text-xs font-semibold text-green-400">Business Guru</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-slate-800 border border-slate-700">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 text-green-400 animate-spin" />
                        <span className="text-sm text-slate-400">Business Guru está digitando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-800 bg-slate-900 p-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Digite sua pergunta sobre negócios..."
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="h-5 w-5" />
                    <span>Enviar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
