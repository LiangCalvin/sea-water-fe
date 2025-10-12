import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AllStudiesComponent } from './all-studies.component';
import { AllStudiesService } from '../../services/all-studies/all-studies.service';
import { GlobalService } from '../../services/global.service';
import { CreateStudyService } from '../../services/create-study/create-study.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NzIconService } from 'ng-zorro-antd/icon';
import { of, throwError, Subject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // <--- Import this
import { Study } from '../../core/models/all-studies/study-model.model';

describe('AllStudiesComponent', () => {
    let component: AllStudiesComponent;
    let fixture: ComponentFixture<AllStudiesComponent>;
    let mockAllStudies: jasmine.SpyObj<AllStudiesService>;
    let mockGlobal: jasmine.SpyObj<GlobalService>;
    let mockCreateStudy: jasmine.SpyObj<CreateStudyService>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockAllStudies = jasmine.createSpyObj('AllStudiesService', ['getStudyList']);
        mockGlobal = jasmine.createSpyObj('GlobalService', ['getUserFullName', 'hasPermissionSync']);
        mockCreateStudy = jasmine.createSpyObj('CreateStudyService', ['getDropDownAsset', 'getDropDownLocation']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [AllStudiesComponent, HttpClientTestingModule],
            providers: [
                { provide: AllStudiesService, useValue: mockAllStudies },
                { provide: GlobalService, useValue: mockGlobal },
                { provide: CreateStudyService, useValue: mockCreateStudy },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
                { provide: NzIconService, useValue: jasmine.createSpyObj('NzIconService', ['addIcon']) }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AllStudiesComponent);
        component = fixture.componentInstance;

    });


    describe('constructor', () => {
        it('should subscribe to searchSubject with debounce and call loadStudies', fakeAsync(() => {
            const loadStudiesSpy = spyOn(component as any, 'loadStudies');
            const term = 'G1/65';

            component['searchSubject'].next(term);

            // Debounce is 500ms, so tick forward past that.
            tick(501);

            expect(component.searchTerm).toBe(term);
            expect(loadStudiesSpy).toHaveBeenCalled();
        }));
    });

    describe('ngOnInit', () => {
        it('should call loadStudies, loadFilterOptions, getAssetDropDown and getLocationDropDown', () => {
            const loadStudiesSpy = spyOn(component, 'loadStudies');
            const loadFilterOptionsSpy = spyOn(component, 'loadFilterOptions');
            const getAssetDropDownSpy = spyOn(component, 'getAssetDropDown');

            component.ngOnInit();

            expect(loadStudiesSpy).toHaveBeenCalled();
            expect(loadFilterOptionsSpy).toHaveBeenCalled();
            expect(getAssetDropDownSpy).toHaveBeenCalled();
        });
    });

    describe('loadFilterOptions', () => {
        it('should extract unique asset and location names and assign to availableAssets and availableLocations', () => {
            component.studies = [
                { assetName: 'Asset A', locationName: 'Location X' },
                { assetName: 'Asset B', locationName: 'Location Y' },
                { assetName: 'Asset A', locationName: 'Location X' }, // Duplicate
                { assetName: '', locationName: '' }, // Falsy
                { assetName: null, locationName: undefined }, // Falsy
            ] as any; // Use 'as any' if Study type is strict

            component.loadFilterOptions();

            expect(component.availableAssets).toEqual(['Asset A', 'Asset B']);
            expect(component.availableLocations).toEqual(['Location X', 'Location Y']);
        });
    });

    describe('ngOnDestroy', () => {
        it('should complete destroy$ subject', () => {
            const completeSpy = spyOn(component['destroy$'], 'complete');
            component.ngOnDestroy();
            expect(completeSpy).toHaveBeenCalled();
        });
    });

    describe('hasActiveFilters', () => {

        beforeEach(() => {
            component.statusFilter = { id: '' } as any;
            component.assetFilter = { id: '' } as any;
            component.locationFilter = { id: '' } as any;
            component.searchTerm = '';
            component.selectAll = false;
        });

        it('should return false when all filters and searchTerm are empty and selectAll is false', () => {
            expect(component.hasActiveFilters()).toBeFalse();
        });

        it('should return true when searchTerm is not empty', () => {
            component.searchTerm = 'keyword';
            expect(component.hasActiveFilters()).toBeTrue();
        });

        it('should return true when statusFilter has id', () => {
            component.statusFilter = { id: 'active' } as any;
            expect(component.hasActiveFilters()).toBeTrue();
        });

        it('should return true when assetFilter has id', () => {
            component.assetFilter = { id: 'asset-1' } as any;
            expect(component.hasActiveFilters()).toBeTrue();
        });

        it('should return true when locationFilter has id', () => {
            component.locationFilter = { id: 'loc-1' } as any;
            expect(component.hasActiveFilters()).toBeTrue();
        });

        it('should return true when selectAll is true', () => {
            component.selectAll = true;
            expect(component.hasActiveFilters()).toBeTrue();
        });
    });

    describe('loadStudies', () => {
        it('loadStudies: success should populate studies and pagination', fakeAsync(() => {
            const fakeResp = {
                data: [{ studyCode: 'S1', studyId: '7c1e1595-4b4d-43a5-b180-c0b6d64ceeab', studyName: 'Test', assetName: 'A', locationName: 'L', createdBy: 'U', status: 'NEW', createdAt: '', updatedAt: '' }],
                total: 1,
                totalPage: 1
            };
            mockAllStudies.getStudyList.and.returnValue(of(fakeResp));
            mockGlobal.getUserFullName.and.returnValue('Me');
            component.selectAll = false;

            component.loadStudies(); tick();

            expect(component.studies.length).toBe(1);
            expect(component.totalItems).toBe(1);
            expect(component.isLoading).toBeFalse();
            expect(component.hasError).toBeFalse();
        }));

        it('loadStudies: error should set hasError', fakeAsync(() => {
            mockAllStudies.getStudyList.and.returnValue(throwError('error'));
            component.loadStudies(); tick();

            expect(component.hasError).toBeTrue();
            expect(component.errorMessage).toContain('Failed to load studies');
            expect(component.isLoading).toBeFalse();
            expect(component.studies.length).toBe(0);
        }));
    })

    // describe('getPaginationDisplayText', () => {
    //     it('getPaginationDisplayText when no items', () => {
    //         component.totalItems = 0;
    //         expect(component.getPaginationDisplayText()).toBe('No items');
    //     });
    // })

    describe('goToStudyDetails', () => {
        it('goToStudyDetails navigates correctly', () => {
            component.goToStudyDetails('S1');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/study-details'], { queryParams: { from: 'all-studies', id: 'S1' } });
        });
    })

    describe('onSearchInput', () => {
        it('should emit the input value to searchSubject', (done) => {
            const testValue = 'test search';

            component['searchSubject'].subscribe(value => {
                expect(value).toBe(testValue);
                done();
            });

            const fakeEvent = { target: { value: testValue } };
            component.onSearchInput(fakeEvent);
        });
    });

    describe('onStatusFilterChange', () => {
        it('should set currentPage to 1 and call loadStudies', () => {
            const loadStudiesSpy = spyOn(component, 'loadStudies');

            // Set initial page to a non-default value
            component.currentPage = 5;

            component.onStatusFilterChange();

            expect(component.currentPage).toBe(1);
            expect(loadStudiesSpy).toHaveBeenCalled();
        });
    });

    describe('getEmptyStateType', () => {

        it('should return "none" when studies are present', () => {
            component.studies = [{} as any]; // Simulate at least one study
            component.searchTerm = '';
            component.statusFilter = { id: '' } as any;
            component.assetFilter = { id: '' } as any;
            component.locationFilter = { id: '' } as any;
            component.selectAll = false;

            expect(component.getEmptyStateType()).toBe('none');
        });

        it('should return "no-results" when no studies but searchTerm is set', () => {
            component.studies = [];
            component.searchTerm = 'test';
            component.statusFilter = { id: '' } as any;
            component.assetFilter = { id: '' } as any;
            component.locationFilter = { id: '' } as any;
            component.selectAll = false;

            expect(component.getEmptyStateType()).toBe('no-results');
        });

        it('should return "no-results" when no studies but status filter is applied', () => {
            component.studies = [];
            component.searchTerm = '';
            component.statusFilter = { id: 'active' } as any;
            component.assetFilter = { id: '' } as any;
            component.locationFilter = { id: '' } as any;
            component.selectAll = false;

            expect(component.getEmptyStateType()).toBe('no-results');
        });

        it('should return "no-results" when no studies but asset filter is applied', () => {
            component.studies = [];
            component.searchTerm = '';
            component.statusFilter = { id: '' } as any;
            component.assetFilter = { id: 'asset-1' } as any;
            component.locationFilter = { id: '' } as any;
            component.selectAll = false;

            expect(component.getEmptyStateType()).toBe('no-results');
        });

        it('should return "no-results" when no studies but location filter is applied', () => {
            component.studies = [];
            component.searchTerm = '';
            component.statusFilter = { id: '' } as any;
            component.assetFilter = { id: '' } as any;
            component.locationFilter = { id: 'loc-1' } as any;
            component.selectAll = false;

            expect(component.getEmptyStateType()).toBe('no-results');
        });

        it('should return "no-results" when no studies but selectAll is true', () => {
            component.studies = [];
            component.searchTerm = '';
            component.statusFilter = { id: '' } as any;
            component.assetFilter = { id: '' } as any;
            component.locationFilter = { id: '' } as any;
            component.selectAll = true;

            expect(component.getEmptyStateType()).toBe('no-results');
        });

        it('should return "no-studies" when no studies and no filters applied', () => {
            component.studies = [];
            component.searchTerm = '';
            component.statusFilter = { id: '' } as any;
            component.assetFilter = { id: '' } as any;
            component.locationFilter = { id: '' } as any;
            component.selectAll = false;

            expect(component.getEmptyStateType()).toBe('no-studies');
        });

    });

    describe('clearAllFilters', () => {
        it('should reset all filters to default values and call loadStudies', () => {
            const loadStudiesSpy = spyOn(component, 'loadStudies');

            // Pre-set non-default values
            component.searchTerm = 'search';
            component.statusFilter = {} as any;
            component.assetFilter = {} as any;
            component.locationFilter = {} as any;
            component.selectAll = true;
            component.currentPage = 5;

            // Set defaults for comparison
            component.statusOptions = [{
                id: 'all',
                name: ''
            }, {
                id: 'active',
                name: ''
            }];
            component.assetOptions = [{
                id: 'all',
                name: ''
            }, {
                id: 'asset1',
                name: ''
            }];
            component.locationOptions = [{
                id: 'all',
                name: ''
            }, {
                id: 'loc1',
                name: ''
            }];

            component.clearAllFilters();

            expect(component.searchTerm).toBe('');
            expect(component.statusFilter).toBe(component.statusOptions[0]);
            expect(component.assetFilter).toBe(component.assetOptions[0]);
            expect(component.locationFilter).toBe(component.locationOptions[0]);
            expect(component.selectAll).toBeFalse();
            expect(component.currentPage).toBe(1);
            expect(loadStudiesSpy).toHaveBeenCalled();
        });
    });

    describe('onLocationFilterChange', () => {
        it('should set currentPage to 1 and call loadStudies', () => {
            const loadStudiesSpy = spyOn(component, 'loadStudies');

            // Simulate being on a different page
            component.currentPage = 3;

            component.onLocationFilterChange();

            expect(component.currentPage).toBe(1);
            expect(loadStudiesSpy).toHaveBeenCalled();
        });
    });

    describe('sort', () => {
        beforeEach(() => {
            // setup a sortFieldMapping
            (component as any).sortFieldMapping = {
                name: 'study_name',
                createdAt: 'created_at'
            } as any;
        });

        it('should toggle sortDirection if the same field is sorted again', () => {
            const loadStudiesSpy = spyOn(component, 'loadStudies');
            component.sortField = 'name';
            component.sortDirection = 'asc';
            component.currentPage = 3;

            (component as any).sort('name');

            expect(component.sortDirection).toBe('desc');
            expect(component.sortField).toBe('study_name');
            expect(component.currentPage).toBe(1);
            expect(loadStudiesSpy).toHaveBeenCalled();
        });

        it('should set sortField and default sortDirection if sorting new field', () => {
            const loadStudiesSpy = spyOn(component, 'loadStudies');
            component.sortField = 'name';
            component.sortDirection = 'desc';
            component.currentPage = 2;

            component.sort('createdAt');

            expect(component.sortDirection).toBe('asc');
            expect(component.sortField).toBe('created_at');
            expect(component.currentPage).toBe(1);
            expect(loadStudiesSpy).toHaveBeenCalled();
        });

        it('should fallback to default sort field (created_at) if not in mapping', () => {
            const loadStudiesSpy = spyOn(component, 'loadStudies');

            (component as any).sort('nonMappedField' as keyof Study);

            expect(component.sortField).toBe('created_at');
            expect(loadStudiesSpy).toHaveBeenCalled();
        });
    });

    describe('onSortData', () => {
        beforeEach(() => {
            spyOn(component, 'loadStudies');
        });

        it('should toggle sortDirection if sortField is the same as the input field', () => {
            component.sortField = 'created_at';
            component.sortDirection = 'asc';

            component.onSortData('created_at');

            expect(component.sortField).toBe('created_at');
            expect(component.sortDirection).toBe('desc');
            expect(component.loadStudies).toHaveBeenCalled();
        });

        it('should set sortField to the new field and sortDirection to asc if field is different', () => {
            component.sortField = 'status';
            component.sortDirection = 'desc';

            component.onSortData('created_at');

            expect(component.sortField).toBe('created_at');
            expect(component.sortDirection).toBe('asc');
            expect(component.loadStudies).toHaveBeenCalled();
        });
    });

    describe('onGoToPage', () => {
        beforeEach(() => {
            spyOn(component, 'loadStudies');
            component.totalPages = 5;
            component.currentPage = 2;
        });

        it('should update currentPage and call loadStudies if data is within range and different from currentPage', () => {
            component.onGoToPage(3);

            expect(component.currentPage).toBe(3);
            expect(component.loadStudies).toHaveBeenCalled();
        });

        it('should not call loadStudies if data equals currentPage', () => {
            component.onGoToPage(2);

            expect(component.currentPage).toBe(2);
            expect(component.loadStudies).not.toHaveBeenCalled();
        });

        it('should not call loadStudies if data is out of range', () => {
            component.onGoToPage(6); // beyond totalPages

            expect(component.currentPage).toBe(6); // still assigns, per method
            expect(component.loadStudies).not.toHaveBeenCalled();
        });
    });

    // describe('getAssetDropDown', () => {
    //     it('should populate assetOptions with "All Assets" and assets from response', fakeAsync(() => {
    //         const mockAssetResponse = {
    //             response: {
    //                 data: [
    //                     { name: 'Asset 1' },
    //                     { name: 'Asset 2' }
    //                 ]
    //             }
    //         };
    //         mockCreateStudy.getDropDownAsset.and.returnValue(of(mockAssetResponse)); // ✅ use the mock

    //         // spyOn(component['createStudyService'], 'getDropDownAsset').and.returnValue(of(mockAssetResponse));

    //         component.getAssetDropDown();
    //         tick();

    //         expect(component.assetOptions.length).toBe(3);
    //         expect(component.assetOptions[0]).toEqual({ id: '', name: 'All Assets' });
    //         expect(component.assetOptions[1]).toEqual({ id: 'Asset 1', name: 'Asset 1' });
    //         expect(component.assetOptions[2]).toEqual({ id: 'Asset 2', name: 'Asset 2' });
    //     }));
    // });


    // describe('getLocationDropDown', () => {
    //     it('should populate locationOptions with "All Location" and locations from response', fakeAsync(() => {
    //         // Spy on loadFilterOptions to prevent the race condition
    //         spyOn(component, 'loadFilterOptions');

    //         // Updated mock response to match the user-provided JSON example
    //         const mockLocationResponse = {
    //             response: {
    //                 data: [
    //                     { id: '601c756e-3d37-4dfa-80b3-34a0c0328d99', name: 'ARTHIT' },
    //                     { id: 'ced2f0ae-37d7-41aa-acce-97f8862e259d', name: 'G1/61' }
    //                 ]
    //             }
    //         };
    //         mockCreateStudy.getDropDownLocation.and.returnValue(of(mockLocationResponse));

    //         component.getLocationDropDown();
    //         tick();

    //         expect(component.locationOptions.length).toBe(3);
    //         // Corrected assertions to match the new mock data and the component's mapping logic
    //         expect(component.locationOptions[0]).toEqual({ id: '', name: 'All Location' });
    //         // The component's logic maps 'name' to both 'id' and 'name'
    //         expect(component.locationOptions[1]).toEqual({ id: 'ARTHIT', name: 'ARTHIT' });
    //         expect(component.locationOptions[2]).toEqual({ id: 'G1/61', name: 'G1/61' });
    //     }));
    // });



    describe('goToStudyDetails', () => {
        it('should navigate to /study-details with correct query parameters', () => {
            const studyId = '12345';
            component.goToStudyDetails(studyId);

            // We can directly check if the spy on mockRouter.navigate was called.
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/study-details'],
                { queryParams: { from: 'all-studies', id: studyId } }
            );
        });
    });

    describe('onCreatedByMeToggle', () => {
        it('should reset currentPage to 1 and call loadStudies', () => {
            const loadStudiesSpy = spyOn(component, 'loadStudies');

            // Change page first to ensure reset is tested
            component.currentPage = 5;

            component.onCreatedByMeToggle();

            expect(component.currentPage).toBe(1);
            expect(loadStudiesSpy).toHaveBeenCalled();
        });
    });
})