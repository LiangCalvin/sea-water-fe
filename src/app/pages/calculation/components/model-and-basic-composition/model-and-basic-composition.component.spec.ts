import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelAndBasicCompositionComponent } from './model-and-basic-composition.component';

describe('ModelAndBasicCompositionComponent', () => {
  let component: ModelAndBasicCompositionComponent;
  let fixture: ComponentFixture<ModelAndBasicCompositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelAndBasicCompositionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelAndBasicCompositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
