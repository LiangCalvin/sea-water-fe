import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErosionalVelocityComponent } from './erosional-velocity.component';

describe('ErosionalValocityComponent', () => {
    let component: ErosionalVelocityComponent;
    let fixture: ComponentFixture<ErosionalVelocityComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ErosionalVelocityComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ErosionalVelocityComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
