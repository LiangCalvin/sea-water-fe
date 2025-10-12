import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalTemplateComponent } from './global-template.component';

describe('GlobalTemplateComponent', () => {
  let component: GlobalTemplateComponent;
  let fixture: ComponentFixture<GlobalTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
