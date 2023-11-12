import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from 'reactfire';

interface Message {
  byUser: boolean;
  text: string;
  time: Date;
}

function Chat() {
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [answerLoading, setAnswerLoading] = useState(false);
  const chattingFunctionality = httpsCallable(useFunctions(), 'chattingFunctionality');

  const sendMessage = async () => {
    if (answerLoading || !value) return;
    setMessages((prev) => [...prev, { byUser: true, text: value, time: new Date() }]);
    const message = value
    setValue('');
    setAnswerLoading(true);
    const resp: any = await chattingFunctionality({message: message});
    const reply = resp.data?.message
    if (reply) {
      setMessages((prev) => [...prev, { byUser: false, text: reply, time: new Date() }]);
    }
    setAnswerLoading(false);
  };

  useEffect(() => {
    if (messages.length === 0) {
      setAnswerLoading(true);
      setTimeout(() => {
        setMessages(() => [{ byUser: false, text: 'Hi, how can I help you?', time: new Date() }]);
        setAnswerLoading(false);
      }, 1500);
    }
  }, []);


  const formatDate = (date: Date) => date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

  const reversed = [...messages].reverse();

  return (
    <div className="flex flex-col items-center justify-end w-full h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] p-5">
      <div className="w-full max-w-[800px] overflow-y-scroll pr-4 flex flex-col-reverse">
        {reversed.map((message, i) => (
          <div key={i} className={`chat ${message.byUser ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-header">
              {message.byUser ? 'You' : 'Chat bot'}
              <time className="text-xs opacity-50 ml-1">{formatDate(message.time)}</time>
            </div>
            <div className={`chat-bubble ${message.byUser ? 'chat-bubble-success' : 'chat-bubble-accent'}`}>
              {message.text}
            </div>
          </div>
        ))}
        {answerLoading && <span className="loading loading-dots loading-lg mx-6 absolute" />}
      </div>
      <textarea
        className="textarea textarea-bordered textarea-primary w-full h-[80px] max-w-[800px] flex-shrink-0 resize-none my-5"
        placeholder="Type your message here..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
      />
    </div>
  );
}

export default Chat;
