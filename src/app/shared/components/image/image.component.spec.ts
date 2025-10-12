import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageComponent } from './image.component';
import { By } from '@angular/platform-browser';

describe('ImageComponent', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render image with provided src and alt', () => {
    component.src = '/assets/test.png';
    component.alt = 'test image';
    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(img.src).toContain('/assets/test.png');
    expect(img.alt).toBe('test image');
  });

  it('should apply width and height if provided', () => {
    component.src = '/assets/test.png';
    component.width = 100;
    component.height = '200'; 
    fixture.detectChanges();
  
    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
  
    expect(img.style.width).toBe('100px');
    expect(img.style.height).toBe('200px');
  });
  
  

  it('should call handleLoad on load event', () => {
    component.src = '/assets/test.png';
    fixture.detectChanges();

    expect(component.isLoading).toBeTrue();

    const img = fixture.debugElement.query(By.css('img'));
    img.triggerEventHandler('load', {});
    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
    expect(component.isError).toBeFalse();
  });

  it('should call handleError on error event and set fallback', () => {
    component.src = '/assets/broken.png';
    component.fallback = '/assets/fallback.png';
    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css('img'));
    img.triggerEventHandler('error', {});
    fixture.detectChanges();

    expect(component.isError).toBeTrue();
    expect(component.isLoading).toBeFalse();

    expect(component.fallbackSrc).toBe('/assets/fallback.png');
  });

  it('should use default fallback if none provided', () => {
    component.src = '/assets/broken.png';
    component.fallback = '';
    fixture.detectChanges();

    expect(component.fallbackSrc).toContain('no-image.png');
  });
});
