import { ChangeDetectionStrategy, Component, output, OnInit, inject, signal, effect, ElementRef, viewChild } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import type { Chat } from '@google/genai';

interface Message {
  author: 'user' | 'bot';
  content: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotComponent implements OnInit {
  private geminiService = inject(GeminiService);
  
  closeChat = output();
  
  messages = signal<Message[]>([]);
  currentUserMessage = signal('');
  isBotTyping = signal(false);
  
  private chat: Chat | null = null;
  private chatHistoryRef = viewChild<ElementRef<HTMLDivElement>>('chatHistory');

  constructor() {
    effect(() => {
        // Scroll to bottom when messages change
        if (this.chatHistoryRef()) {
            const el = this.chatHistoryRef()!.nativeElement;
            el.scrollTop = el.scrollHeight;
        }
    });
  }

  ngOnInit() {
    this.chat = this.geminiService.createChat();
    this.messages.set([{ author: 'bot', content: 'Hi! How can I help you with your marketing today?' }]);
  }
  
  async sendMessage() {
    const messageContent = this.currentUserMessage().trim();
    if (!messageContent || !this.chat) return;

    // Add user message to chat
    this.messages.update(msgs => [...msgs, { author: 'user', content: messageContent }]);
    this.currentUserMessage.set('');
    this.isBotTyping.set(true);

    try {
        const stream = await this.chat.sendMessageStream({ message: messageContent });

        let botMessage: Message = { author: 'bot', content: ''};
        this.messages.update(msgs => [...msgs, botMessage]);

        for await (const chunk of stream) {
            botMessage.content += chunk.text;
            this.messages.update(msgs => [...msgs]);
        }
    } catch(e) {
        console.error(e);
        this.messages.update(msgs => [...msgs, { author: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
        this.isBotTyping.set(false);
    }
  }

  updateUserMessage(event: Event) {
    const target = event.target as HTMLInputElement;
    this.currentUserMessage.set(target.value);
  }
}
