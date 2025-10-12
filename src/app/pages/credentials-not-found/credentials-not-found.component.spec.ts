import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialsNotFoundComponent } from './credentials-not-found.component';

describe('CredentialsNotFoundComponent', () => {
  let component: CredentialsNotFoundComponent;
  let fixture: ComponentFixture<CredentialsNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredentialsNotFoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CredentialsNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
