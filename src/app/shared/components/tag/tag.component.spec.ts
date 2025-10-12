import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagComponent } from './tag.component';

describe('TagComponent', () => {
  let component: TagComponent;
  let fixture: ComponentFixture<TagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TagComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct tagStyle when border is false and circle is false', () => {
    component.textColor = '#000000';
    component.border = false;
    component.circle = false;

    const style = component.tagStyle;
    expect(style['color']).toBe('#000000');
    expect(style['border']).toBe('none');
  });

  it('should return correct tagStyle when border is true', () => {
    component.border = true;
    component.borderColor = '#FF0000';

    const style = component.tagStyle;
    expect(style['border']).toBe('1px solid #FF0000');
  });

  it('should return correct circleStyle when circle is true', () => {
    component.circle = true;
    const style = component.tagStyle;

    expect(style['width']).toBe('14px');
    expect(style['height']).toBe('14px');
    expect(style['line-height']).toBe('32px');
    expect(style['border-radius']).toBe('50%');
  });

  it('circleStyle method should return correct styles', () => {
    const circleStyle = component.circleStyle();
    expect(circleStyle['width']).toBe('14px');
    expect(circleStyle['height']).toBe('14px');
    expect(circleStyle['line-height']).toBe('32px');
    expect(circleStyle['text-align']).toBe('center');
    expect(circleStyle['border-radius']).toBe('50%');
    expect(circleStyle['padding']).toBe('0');
    expect(circleStyle['display']).toBe('inline-block');
  });

  it('should have default input values', () => {
    expect(component.text).toBe('');
    expect(component.backgroundColor).toBe('#E0F2FE');
    expect(component.textColor).toBe('#193C55');
    expect(component.border).toBeFalse();
    expect(component.borderColor).toBe('');
    expect(component.circle).toBeFalse();
  });
});
