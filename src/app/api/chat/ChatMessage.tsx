import { Avatar } from '@/components/ui/avatar';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';
  
  return (
    <div className={ `flex gap-3  ${isUser ? 'flex-row-reverse' : 'flex-row'} `}>
      <Avatar className= "w-8 h-8 ">
        <div className={ `w-full h-full flex items-center justify-center  ${
          isUser ? 'bg-orange-500' : 'bg-violet-600'
        } text-white font-semibold `}>
          {isUser ? 'B' : 'AI'}
        </div>
      </Avatar>

      <div className={ `flex flex-col max-w-[70%]  ${isUser ? 'items-end' : 'items-start'} `}>
        <div className={ `rounded-lg px-4 py-2  ${
          isUser
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 text-gray-900 border border-gray-200'
        } `}>
          <p className= "text-sm whitespace-pre-wrap ">{content}</p>
        </div>
        {timestamp && (
          <span className= "text-xs text-gray-500 mt-1 ">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}