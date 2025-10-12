import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent {
  @Input() src!: string;
  @Input() alt = '';
  @Input() width?: string | number;
  @Input() height?: string | number;
  @Input() fit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' = 'cover';
  @Input() fallback = '/assets/fallback.png';
  @Input() loading: 'lazy' | 'eager' = 'lazy';
  private readonly defaultFallback = '../../../../assets/images/no-image.png';
  isLoading = true;
  isError = false;

  handleLoad() {
    this.isLoading = false;
  }

  handleError() {
    this.isError = true;
    this.isLoading = false;
  }

  get fallbackSrc(): string {
    return this.fallback || this.defaultFallback;
  }
}
