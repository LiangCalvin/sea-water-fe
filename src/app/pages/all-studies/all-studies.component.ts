import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Study,
  StudyListParams,
} from '../../core/models/all-studies/study-model.model';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AllStudiesService } from '../../services/all-studies/all-studies.service';
import { GlobalService } from '../../services/global.service';
import { NzIconModule, NzIconService } from 'ng-zorro-antd/icon';
import {
  AssetOption,
  IdName,
  LocationOption,
} from '../../shared/models/id-name.model';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { LoadingOutline } from '@ant-design/icons-angular/icons';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { TableComponent } from '../../shared/components/table/table.component';
import { CreateStudyService } from '../../services/create-study/create-study.service';
import { cleanObject } from '../../shared/Utils/cleanJSON';
import {
  StudyConstants,
  StudyConstantsParam,
} from '../../core/enums/all-studies.enum';

@Component({
  selector: 'app-all-studies',
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    FormsModule,
    NzIconModule,
    DropdownComponent,
    NzSpinModule,
    TableComponent,
    NzAutocompleteModule,
    NzInputModule,
  ],
  templateUrl: './all-studies.component.html',
  styleUrl: './all-studies.component.scss',
})
export class AllStudiesComponent implements OnInit {
  studies: any[] = [];
  isLoading = false;
  hasError = false;
  errorMessage = '';
  hasEverLoadedData = false;
  isInitialLoad = true;
  shouldShowSuggestions = false;
  statusOptions: IdName[] = [
    { id: '', name: 'All Status' },
    { id: 'NEW', name: 'NEW' },
    { id: 'IN_PROGRESS', name: 'IN-PROGRESS' },
    { id: 'COMPLETED', name: 'COMPLETED' }
  ];

  assetOptions: AssetOption[] = [{ id: '', name: 'All Assets' }];

  locationOptions: LocationOption[] = [{ id: '', name: 'All Location' }];

  allPossibleValues: string[] = [];

  columnData = [
    {
      key: 'studyCode',
      label: 'Study ID',
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'studyName',
      label: 'Study Name',
    },
    {
      key: 'assetName',
      label: 'Field Assets',
    },
    {
      key: 'locationName',
      label: 'Location',
    },
    {
      key: 'createdBy',
      label: 'Created By',
    },

    {
      key: 'createdAt',
      label: 'Date Created',
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
    },
  ];

  selectAll = false;
  searchTerm: string = '';
  statusFilter: IdName = this.statusOptions[0];
  assetFilter: IdName = this.assetOptions[0];
  locationFilter: IdName = this.locationOptions[0];
  sortField = 'created_at';
  sortDirection: string = '';
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 1;
  totalItems = 0;
  availableStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  availableAssets: string[] = [];
  availableLocations: string[] = [];
  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  private readonly sortFieldMapping: Record<string, string> = {
    studyId: 'study_code',
    studyName: 'study_name',
    assetName: 'asset_name',
    locationName: 'location_name',
    createdBy: 'created_by',
    status: 'status',
    createdAt: 'created_at',
    lastUpdated: 'updated_at',
  };

  constructor(
    private readonly router: Router,
    private readonly allstudiesService: AllStudiesService,
    private readonly globalService: GlobalService,
    private readonly iconService: NzIconService,
    private readonly createStudyService: CreateStudyService,
  ) {
    this.iconService.addIcon(LoadingOutline);
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.searchTerm = searchTerm;
        this.currentPage = 1;
        this.loadStudies();
      });
  }

  ngOnInit(): void {
    this.loadStudies();
    this.loadFilterOptions();
    this.getAssetDropDown();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFilterOptions() {
    const uniqueAssets = [
      ...new Set(this.studies.map((study) => study.assetName)),
    ];
    const uniqueLocations = [
      ...new Set(this.studies.map((study) => study.locationName)),
    ];

    this.availableAssets = uniqueAssets.filter(Boolean);
    this.availableLocations = uniqueLocations.filter(Boolean);
  }

  onSearchEnter(): void {
    this.loadStudies();
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value || '';
    this.searchTerm = value;
  }

  onSuggestionSelected(selectedValue: string): void {
    this.searchTerm = selectedValue;
    this.loadStudies();
  }

  onEnter(): void {
    this.loadStudies();
  }

  loadStudies() {
    this.isLoading = true;
    this.hasError = false;

    const params: StudyListParams = {
      limit: this.itemsPerPage,
      page: this.currentPage,
      order: this.sortDirection,
      sort: this.mappingKeyStudy(this.sortField as StudyConstants),
      search: this.searchTerm,
      status: this.statusFilter?.id || '',
      asset_name: this.assetFilter?.id || '',
      location_name: this.locationFilter?.id || '',
      ...(this.selectAll && {
        created_by: this.globalService.getUserFullName(),
      }),
    };
    const req = cleanObject(params);
    this.allstudiesService.getStudyList(req).subscribe({
      next: (response) => {
        if (response && response.data && Array.isArray(response.data)) {
          this.studies = response.data.map((item) => ({
            studyId: item.studyId,
            studyCode: item.studyCode,
            studyName: item.studyName,
            assetName: item.assetName,
            locationName: item.locationName,
            createdBy: item.createdBy,
            status: item.status,
            updatedAt: item.updatedAt ?? '',
            createdAt: item.createdAt ?? '',
          }));
          this.totalItems = response.total ?? 0;
          this.totalPages = response.totalPage ?? 1;
          if (this.isInitialLoad && this.totalItems > 0) {
            this.hasEverLoadedData = true;
          }
        } else {
          this.studies = [];
          this.totalItems = 0;
          this.totalPages = 1;
        }
        this.isLoading = false;
        this.updateFilterOptions();
      },
      error: (error) => {
        console.error('Error loading studies:', error);
        this.hasError = true;
        this.errorMessage = 'Failed to load studies. Please try again.';
        this.isLoading = false;
        this.studies = [];
      },
    });
  }

  getEmptyStateType(): 'no-studies' | 'no-results' | 'none' {
    if (this.studies.length > 0) {
      return 'none';
    }
    const hasFilters =
      this.searchTerm.trim() !== '' ||
      this.statusFilter?.id !== '' ||
      this.assetFilter?.id !== '' ||
      this.locationFilter?.id !== '' ||
      this.selectAll;

    if (hasFilters) {
      return 'no-results';
    }
    return 'no-studies';
  }

  hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim() !== '' ||
      this.statusFilter?.id !== '' ||
      this.assetFilter?.id !== '' ||
      this.locationFilter?.id !== '' ||
      this.selectAll
    );
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.statusFilter = this.statusOptions[0];
    this.assetFilter = this.assetOptions[0];
    this.locationFilter = this.locationOptions[0];
    this.selectAll = false;
    this.currentPage = 1;
    this.loadStudies();
  }

  updateFilterOptions() {
    if (this.studies.length > 0) {
      const uniqueAssets = [
        ...new Set(this.studies.map((study) => study.assetName)),
      ];
      const uniqueLocations = [
        ...new Set(this.studies.map((study) => study.locationName)),
      ];
      this.availableAssets = [
        ...new Set([...this.availableAssets, ...uniqueAssets]),
      ].filter(Boolean);
      this.availableLocations = [
        ...new Set([...this.availableLocations, ...uniqueLocations]),
      ].filter(Boolean);
    }
  }

  onCreateNewStudy() {
    this.router.navigate(['/create-new-study']);
  }

  onSearchInput(event: any) {
    this.searchSubject.next(event.target.value);
  }

  onStatusFilterChange() {
    this.currentPage = 1;
    this.loadStudies();
  }

  onAssetFilterChange() {
    this.locationFilter = this.locationOptions[0];
    if (this.assetFilter && this.assetFilter.id) {
      const selectedAsset = this.assetOptions.find(
        (option) => option.id === this.assetFilter.id,
      ) as AssetOption;

      if (selectedAsset?.assetId) {
        this.getLocationDropDown(selectedAsset.assetId);
      }
    } else {
      this.locationOptions = [{ id: '', name: 'All Location' }];
    }
    this.currentPage = 1;
    this.loadStudies();
  }

  onLocationFilterChange() {
    this.currentPage = 1;
    this.loadStudies();
  }

  sort(field: keyof Study) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    const backendSortField = this.sortFieldMapping[field] || 'created_at';
    this.sortField = backendSortField;

    this.currentPage = 1;
    this.loadStudies();
  }

  onSortData(field: string) {
    if (this.sortField !== field) {
      this.sortField = field;
      this.sortDirection = 'asc';
    } else {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = '';
        this.sortField = '';
      } else {
        this.sortDirection = 'asc';
      }
    }
    this.loadStudies();
  }

  onGoToPage(data: any) {
    if (data >= 1 && data <= this.totalPages && data !== this.currentPage) {
      this.currentPage = data;
      this.loadStudies();
    }
    this.currentPage = data;
  }

  getAssetDropDown() {
    this.createStudyService
      .getDropDownAsset()
      .subscribe(async (response: any) => {
        try {
          this.assetOptions = [
            { id: '', name: 'All Assets' },
            ...response.data.map((asset: any) => ({
              id: asset.name,
              name: asset.name,
              assetId: asset.id,
            })),
          ];
        } catch (error) {
          console.log('error :', error);
        }
      });
  }

  getLocationDropDown(assetId: string) {
    this.locationOptions = [{ id: '', name: 'All Location' }];

    if (!assetId) {
      return;
    }
    this.createStudyService
      .getDropDownLocation(assetId)
      .subscribe(async (response: any) => {
        try {
          this.locationOptions = [
            { id: '', name: 'All Location' },
            ...response.data.map((location: any) => ({
              id: location.name,
              name: location.name,
              locationId: location.id,
            })),
          ];
        } catch (error) {
          console.log('error :', error);
        }
      });
  }

  goToStudyDetails(value: string) {
    this.router.navigate(['/study-details'], {
      queryParams: { from: 'all-studies', id: value },
    });
  }

  mappingKeyStudy(key: StudyConstants): string {
    return StudyConstantsParam[key] ?? '';
  }

  get isLocationDisabled(): boolean {
    return !this.assetFilter.id || this.assetFilter.id === '';
  }

  onCreatedByMeToggle() {
    this.currentPage = 1;
    this.loadStudies();
  }
}
