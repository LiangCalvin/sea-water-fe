import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewStudyComponent } from './create-new-study.component';

describe('CreateNewStudyComponent', () => {
  let component: CreateNewStudyComponent;
  let fixture: ComponentFixture<CreateNewStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateNewStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateNewStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
