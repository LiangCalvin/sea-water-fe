import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipingDataComponent } from './piping-data.component';

describe('PipingDataComponent', () => {
  let component: PipingDataComponent;
  let fixture: ComponentFixture<PipingDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipingDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipingDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
