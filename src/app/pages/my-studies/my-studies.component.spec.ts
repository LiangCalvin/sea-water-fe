import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyStudiesComponent } from './my-studies.component';

describe('MyStudiesComponent', () => {
  let component: MyStudiesComponent;
  let fixture: ComponentFixture<MyStudiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyStudiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyStudiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
