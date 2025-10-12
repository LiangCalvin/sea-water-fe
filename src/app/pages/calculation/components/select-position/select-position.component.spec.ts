import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPositionComponent } from './select-position.component';

describe('SelectPositionComponent', () => {
  let component: SelectPositionComponent;
  let fixture: ComponentFixture<SelectPositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectPositionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
