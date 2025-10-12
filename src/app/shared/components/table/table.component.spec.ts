import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { InboxOutline } from '@ant-design/icons-angular/icons';
import { COLUMN_ID } from '../../../core/enums/app-config.enum';
import { colorStatus, Status } from '../../../core/enums/all-studies.enum';
import { UserNameService } from '../../services/user-name.service';
import { GlobalService } from '../../../services/global.service';

describe('TableComponent', () => {
    let component: TableComponent;
    let fixture: ComponentFixture<TableComponent>;
    let mockUserNameService: jasmine.SpyObj<UserNameService>;
    let mockGlobalService: jasmine.SpyObj<GlobalService>;

    beforeEach(async () => {
        mockUserNameService = jasmine.createSpyObj('UserNameService', ['displayName', 'displayStudyName']);
        mockGlobalService = jasmine.createSpyObj('GlobalService', ['getUserFullName', 'hasPermissionSync']);
        mockGlobalService.getUserFullName.and.returnValue('John Doe');

        await TestBed.configureTestingModule({
            imports: [TableComponent, NzIconModule.forRoot([InboxOutline])],
            providers: [
                { provide: UserNameService, useValue: mockUserNameService },
                { provide: GlobalService, useValue: mockGlobalService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TableComponent);
        component = fixture.componentInstance;

        component.data = [
            { STUDY_ID: 'id1', name: 'Study 1' },
            { CALCULATION_ID: 'calc2', name: 'Calculation 2' },
            { name: 'NoId Row' }
        ];
        component.totalPages = 10;
        component.currentPage = 1;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.Owner).toBe('John Doe');
    });


    describe('sort', () => {
        it('should emit sortChange event with field', () => {
            spyOn(component.sortChange, 'emit');
            component.sort('name');
            expect(component.sortChange.emit).toHaveBeenCalledWith('name');
        });
    });

    describe('goToPage', () => {
        it('should emit pageChange event if page is not "..."', () => {
            spyOn(component.pageChange, 'emit');
            component.goToPage(3);
            expect(component.pageChange.emit).toHaveBeenCalledWith(3);
            component.goToPage('...');
            expect(component.pageChange.emit).toHaveBeenCalledTimes(1); // no emit for '...'
        });
    });

    describe('onRowClick', () => {
        it('should emit rowChange event with STUDY_ID if available', () => {
            spyOn(component.rowChange, 'emit');
            const row = { [COLUMN_ID.STUDY_ID]: 'abc', [COLUMN_ID.CALCULATION_ID]: 'def' };
            component.onRowClick(row);
            expect(component.rowChange.emit).toHaveBeenCalledWith('abc');
        });
    });

    describe('displayName', () => {
        it('should call userNameService.displayName with name', () => {
            mockUserNameService.displayName.and.returnValue('Alice');
            const result = component.displayName('alice');
            expect(mockUserNameService.displayName).toHaveBeenCalledWith('alice');
            expect(result).toBe('Alice');
        });
    });

    describe('displayStudyName', () => {
        it('should call userNameService.displayStudyName with name', () => {
            mockUserNameService.displayStudyName.and.returnValue('Study ABC');
            const result = component.displayStudyName('abc');
            expect(mockUserNameService.displayStudyName).toHaveBeenCalledWith('abc');
            expect(result).toBe('Study ABC');
        });
    });

    describe('displayColorStatus', () => {
        it('should return red for failed status', () => {
            const result = component.displayColorStatus('FAILED' as Status);
            expect(result).toBe(colorStatus['FAILED']);
        });
    });

    describe('handleClickOutside', () => {
        it('should set expandedRow to null if click is outside action-cell', () => {
            component.expandedRow = 5;
            const event = { target: { closest: () => null } } as unknown as MouseEvent;
            component.handleClickOutside(event);
            expect(component.expandedRow).toBeNull();
        });

    });

});
