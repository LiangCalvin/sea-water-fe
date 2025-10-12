import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FluidDensityComponent } from './fluid-density.component';

describe('FluidDensityComponent', () => {
    let component: FluidDensityComponent;
    let fixture: ComponentFixture<FluidDensityComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FluidDensityComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FluidDensityComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
