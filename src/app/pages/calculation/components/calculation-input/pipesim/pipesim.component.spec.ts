import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipesimComponent } from './pipesim.component';

describe('PipesimComponent', () => {
  let component: PipesimComponent;
  let fixture: ComponentFixture<PipesimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipesimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipesimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
