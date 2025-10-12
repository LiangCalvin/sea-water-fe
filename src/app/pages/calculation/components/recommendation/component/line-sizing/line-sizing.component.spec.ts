import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineSizingComponent } from './line-sizing.component';

describe('LineSizingComponent', () => {
  let component: LineSizingComponent;
  let fixture: ComponentFixture<LineSizingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineSizingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineSizingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
