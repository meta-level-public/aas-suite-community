import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-drag-captcha',
  templateUrl: './drag-captcha.component.html',
  styleUrls: ['./drag-captcha.component.css'],
  imports: [CommonModule, TranslateModule],
})
export class DragCaptchaComponent implements OnDestroy {
  verified = signal(false);
  dropTargetHovered = signal(false);

  translate = inject(TranslateService);

  private colors = [
    { name: 'RED', value: '#f44336' },
    { name: 'GREEN', value: '#4caf50' },
    { name: 'BLUE', value: '#2196f3' },
    { name: 'YELLOW', value: '#ffeb3b' },
    { name: 'PURPLE', value: '#9c27b0' },
  ];

  selectedColor = signal(this.colors[Math.floor(Math.random() * this.colors.length)]);

  colorTrigger = signal(0);
  instruction = computed(() => {
    this.colorTrigger();
    const colorTag = this.selectedColor().name;
    const color = this.translate.instant(colorTag);
    return this.translate.instant('DRAG_DROP_CAPTCHA', { color: color });
  });

  subscriptions: Subscription[] = [];

  constructor() {
    this.subscriptions.push(
      this.translate.onLangChange.subscribe((_event) => {
        this.colorTrigger.set(this.colorTrigger() + 1);
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
    this.dropTargetHovered.set(true);
  }

  clearHover() {
    this.dropTargetHovered.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.verified.set(true);
    this.clearHover();
  }

  dragStart(event: DragEvent) {
    event.dataTransfer?.setData('color', this.selectedColor().value);
  }

  reset() {
    this.verified.set(false);
    this.selectedColor.set(this.colors[Math.floor(Math.random() * this.colors.length)]);
    this.dropTargetHovered.set(false);
    this.colorTrigger.set(this.colorTrigger() + 1);
  }
}
