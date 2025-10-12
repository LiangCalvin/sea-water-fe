import { TestBed } from '@angular/core/testing';

import { ExcelTableService } from './excel-table.service';

describe('ExcelTableService', () => {
    let service: ExcelTableService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ExcelTableService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should have initial value as null', (done) => {
        service.getTableValue$().subscribe(value => {
            expect(value).toBeNull();
            done();
        });
    });

    it('should update table value when setTableValue is called', (done) => {
        const testValue = { id: 1, name: 'Test' };

        service.setTableValue(testValue);

        service.getTableValue$().subscribe(value => {
            expect(value).toEqual(testValue);
            done();
        });
    });

    it('should return snapshot of current value', () => {
        const testValue = { id: 2, name: 'Snapshot' };

        service.setTableValue(testValue);

        const snapshot = service.getSnapshot();
        expect(snapshot).toEqual(testValue);
    });
});
