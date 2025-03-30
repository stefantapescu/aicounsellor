'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input' // Assuming input component exists
import { ScrollArea } from '@/components/ui/scroll-area' // Assuming scroll-area exists
import { SendHorizonal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { saveChatMessage, prepareAssistantPrompt } from './actions' // Import server actions

interface ChatMessage {
  id?: string; // Optional ID from DB
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date; // Optional timestamp
}

interface ChatInterfaceProps {
  userId: string;
  // initialMessages?: ChatMessage[]; // To load previous history
}

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    // Initial system message
    { role: 'system', content: 'Welcome! Ask me about your assessment results, career options, or anything else related to your educational journey.' }
  ]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput(''); // Clear input immediately

    startTransition(async () => {
      // 1. Save user message
      const saveUserMsgResult = await saveChatMessage({ userId, role: 'user', content: userMessage.content });
      if (saveUserMsgResult.error) {
        console.error("Failed to save user message:", saveUserMsgResult.error);
        // Optionally revert message state or show error to user
      }

      // 2. Prepare the prompt using the *current* message list including the user's latest message
      const currentMessageList = [...messages, userMessage]; // Include the message just added to state
      const promptResult = await prepareAssistantPrompt(userId, currentMessageList);

      if (promptResult.error || !promptResult.prompt) {
        console.error("Failed to prepare prompt:", promptResult.error);
        const errorResponse: ChatMessage = { role: 'assistant', content: `Sorry, I encountered an error preparing your context: ${promptResult.error}` };
        setMessages((prev) => [...prev, errorResponse]);
        return; // Stop processing
      }

      // --- Crucial Step: Log Prompt for AI Assistant (Cline) ---
      console.log("--- PROMPT FOR AI ASSISTANT ---");
      console.log(promptResult.prompt);
      console.log("--- END PROMPT ---");

      // --- Placeholder: Inform user while waiting for Cline ---
      const waitingResponse: ChatMessage = {
        role: 'assistant',
        content: `Okay, I've received your message: "${userMessage.content}". I'm processing it now... (Waiting for AI Assistant response)`
      };
      setMessages((prev) => [...prev, waitingResponse]);

      // --- TODO: Cline takes over here ---
      // Cline sees the logged prompt, calls Perplexity MCP, gets the response text.
      // Cline then calls `saveChatMessage` with the assistant's response.
      // For now, we stop here in the code. The assistant message will be added
      // manually or via a subsequent action call by Cline.
    });
  };

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card shadow-sm">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                message.role === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : message.role === 'assistant'
                  ? 'bg-muted'
                  : 'hidden' // Hide system messages or style differently
              )}
            >
              {message.content}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Ask your AI consultant..."
            value={input}
            onChange={handleInputChange}
            disabled={isPending}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
