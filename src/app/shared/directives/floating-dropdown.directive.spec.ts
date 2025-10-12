import { Component, ElementRef, inject } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FloatingDropdownDirective } from './floating-dropdown.directive';

@Component({
  standalone: true,
  template: `
    <div [floatingDropdown]="trigger" [nzVisible]="visible"></div>
  `,
  imports: [FloatingDropdownDirective]
})
class TestHostComponent {
  trigger = inject(ElementRef).nativeElement;
  visible = false;
}

describe('FloatingDropdownDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let directive: FloatingDropdownDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    directive = fixture.debugElement.children[0].injector.get(FloatingDropdownDirective);
  });

  it('should create directive', () => {
    expect(directive).toBeTruthy();
  });
});
