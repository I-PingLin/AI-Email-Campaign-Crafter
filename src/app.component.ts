import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CampaignGeneratorComponent } from './components/campaign-generator/campaign-generator.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CampaignGeneratorComponent, ChatbotComponent],
})
export class AppComponent {
  showChatbot = signal(false);

  toggleChatbot() {
    this.showChatbot.update(value => !value);
  }
}
