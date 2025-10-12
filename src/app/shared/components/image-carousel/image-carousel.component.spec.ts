import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageCarouselComponent } from './image-carousel.component';
import { By } from '@angular/platform-browser';
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';

describe('ImageCarouselComponent', () => {
  let component: ImageCarouselComponent;
  let fixture: ComponentFixture<ImageCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCarouselComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCarouselComponent);
    component = fixture.componentInstance;
    component.images = ['/assets/img1.jpg', '/assets/img2.jpg', '/assets/img3.jpg'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all images', () => {
    const imgs = fixture.debugElement.queryAll(By.css('img'));
    expect(imgs.length).toBe(3);
    expect(imgs[0].nativeElement.src).toContain('/assets/img1.jpg');
  });

  it('should call carousel.pre() when prev button is clicked', () => {
    const carousel = fixture.debugElement.query(By.directive(NzCarouselComponent)).componentInstance as NzCarouselComponent;
    const spy = spyOn(carousel, 'pre');

    const btn = fixture.debugElement.query(By.css('.control.prev'));
    btn.triggerEventHandler('click', {});
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });

  it('should call carousel.next() when next button is clicked', () => {
    const carousel = fixture.debugElement.query(By.directive(NzCarouselComponent)).componentInstance as NzCarouselComponent;
    const spy = spyOn(carousel, 'next');

    const btn = fixture.debugElement.query(By.css('.control.next'));
    btn.triggerEventHandler('click', {});
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });

  it('should show dots when autoplay is true', () => {
    component.autoplay = true;
    fixture.detectChanges();

    const carousel = fixture.debugElement.query(By.directive(NzCarouselComponent)).componentInstance as NzCarouselComponent;
    expect(carousel.nzDots).toBeTrue();
  });

  it('should hide dots when autoplay is false', () => {
    component.autoplay = false;
    fixture.detectChanges();

    const carousel = fixture.debugElement.query(By.directive(NzCarouselComponent)).componentInstance as NzCarouselComponent;
    expect(carousel.nzDots).toBeFalse();
  });
});
