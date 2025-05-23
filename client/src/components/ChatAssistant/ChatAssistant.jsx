import { useState } from 'react';
import { Bot, X } from 'lucide-react';

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    [
  { role: 'user', content: 'Hello' },
  { role: 'assistant', content: 'Hi there!' },
]
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const aiMessage = { role: 'assistant', content: data.reply };

      setMessages([...newMessages, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, I had trouble replying.' },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Bot />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-white shadow-2xl rounded-xl flex flex-col border border-gray-200 z-50">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-100 rounded-t-xl">
            <h2 className="text-sm font-semibold text-gray-700">AI Secretary</h2>
            <button onClick={() => setOpen(false)}>
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-96">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm max-w-[80%] ${
                  msg.role === 'user'
                    ? 'ml-auto bg-blue-100 text-right'
                    : 'mr-auto bg-gray-100'
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 border-t flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none"
              placeholder="Ask me anything..."
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
