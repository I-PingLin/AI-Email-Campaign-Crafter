import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';

interface CampaignResult {
  subjectLines: string[];
  body: string;
  imageUrl: string;
}

type ImageSize = '1:1' | '16:9' | '9:16';

@Component({
  selector: 'app-campaign-generator',
  templateUrl: './campaign-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignGeneratorComponent {
  private geminiService = inject(GeminiService);

  prompt = signal('');
  selectedImageSize = signal<ImageSize>('1:1');
  isLoading = signal(false);
  campaignResult = signal<CampaignResult | null>(null);
  error = signal<string | null>(null);
  
  imageSizes: { value: ImageSize, label: string }[] = [
    { value: '1:1', label: '1K (Square)' },
    { value: '16:9', label: '2K (Landscape)' },
    { value: '9:16', label: '4K (Portrait)' },
  ];

  async generateCampaign() {
    if (!this.prompt().trim()) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.campaignResult.set(null);

    try {
      const campaignText = await this.geminiService.generateCampaign(this.prompt());
      const imageUrl = await this.geminiService.generateImage(campaignText.imagePrompt, this.selectedImageSize());
      
      this.campaignResult.set({
        subjectLines: campaignText.subjectLines,
        body: campaignText.body,
        imageUrl: imageUrl,
      });

    } catch (e) {
      console.error(e);
      this.error.set('An error occurred while generating the campaign. Please check the console for details and try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  updatePrompt(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.prompt.set(target.value);
  }

  setImageSize(size: ImageSize) {
    this.selectedImageSize.set(size);
  }
}
