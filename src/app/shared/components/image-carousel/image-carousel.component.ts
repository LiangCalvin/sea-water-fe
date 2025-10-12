import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCarouselComponent, NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-image-carousel',
  standalone: true,
  imports: [CommonModule, NzCarouselModule, NzIconModule],
  templateUrl: './image-carousel.component.html',
  styleUrls: ['./image-carousel.component.scss']
})
export class ImageCarouselComponent {
  @Input() images: string[] = [];
  @Input() autoplay = true;
  @Input() dotPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  @Input() height = '500px';
  @Input() fit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' = 'cover';


  @ViewChild('carouselRef', { static: false }) carousel?: NzCarouselComponent;

  prev(): void {
    this.carousel?.pre();
  }

  next(): void {
    this.carousel?.next();
  }
}
