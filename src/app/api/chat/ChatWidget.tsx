import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ChatWidget() {
  return (
    <Card className="h-screen max-w-2xl mx-auto p-4">
      <ScrollArea className="h-full mb-4">
        {/* Messages */}
      </ScrollArea>
      
      <div className="flex gap-2">
        <Input 
          placeholder="Type message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </Card>
  );
}