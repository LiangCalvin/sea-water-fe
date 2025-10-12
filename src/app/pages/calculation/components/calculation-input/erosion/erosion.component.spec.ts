import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErosionComponent } from './erosion.component';

describe('ErosionComponent', () => {
  let component: ErosionComponent;
  let fixture: ComponentFixture<ErosionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErosionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErosionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
