import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { TableComponent } from '../../shared/components/table/table.component';
import {
  AlertMessageCalculationConstants,
  AlertMessageStudyConstants,
  colorStatus,
  displayStatus,
  Status,
  StudyDetailConstants,
  StudyDetailConstantsParam,
  StudyDetailsModule,
} from '../../core/enums/all-studies.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { IdName, PageLink } from '../../shared/models/id-name.model';
import { TagComponent } from '../../shared/components/tag/tag.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputTextComponent } from '../../shared/components/input-text/input-text.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { InputSearchComponent } from '../../shared/components/input-search/input-search.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { EditStudyModalComponent } from '../../shared/components/modals/edit-study-modal/edit-study-modal.component';
import { StudyDetailsService } from '../../services/study-details/study-details.service';
import { CommonModule } from '@angular/common';
import { Study } from '../../core/models/all-studies/study-model.model';
import { AlertService } from '../../shared/services/alert.service';
import { GlobalService } from '../../services/global.service';
import { cleanObject } from '../../shared/Utils/cleanJSON';
import { PAGE_NAME_MAP } from '../../core/enums/app-config.enum';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserNameService } from '../../shared/services/user-name.service';
import { TooltipComponent } from '../../shared/components/tooltip/tooltip.component';
import { DeleteCalculationModalComponent } from '../../shared/components/modals/delete-calculation-modal/delete-calculation-modal.component';
import { DeleteStudyModalComponent } from '../../shared/components/modals/delete-study-modal/delete-study-modal.component';
import { RoleEnum } from '../../core/enums/role.enum';

@Component({
  selector: 'app-study-details',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    TableComponent,
    TagComponent,
    ButtonComponent,
    DropdownComponent,
    InputSearchComponent,
    TooltipComponent,
  ],
  templateUrl: './study-details.component.html',
  styleUrl: './study-details.component.scss',
})
export class StudyDetailsComponent {
  sortField = '';
  sortDirection: string = '';
  currentPage = 1;
  itemsPerPage = 25;
  totalPages = 0;
  totalItems = 0;
  isLoading = false;
  createdBy: any = '';
  status: any = '';
  search: any = '';
  displaySelected: boolean = false;
  notFoundText: string = 'No Calculation History';
  pageSize = 25;
  pageSizeOptions = [10, 25, 50, 100];
  statusOptions: any[] = [
    { id: '', name: 'All Status' },
    { id: 'DRAFT', name: 'DRAFT' },
    { id: 'PROCESSING', name: 'PROCESSING' },
    { id: 'DONE', name: 'DONE' },
    { id: 'FAILED', name: 'FAILED' },
  ];
  listMoreAction = [
    {
      title: StudyDetailsModule.RECALCULATE,
    },
    {
      title: StudyDetailsModule.RESUBMIT,
    },
    {
      title: StudyDetailsModule.EDIT,
    },
    {
      title: StudyDetailsModule.EXPORT,
    },
    {
      title: StudyDetailsModule.DELETE,
    }
  ];
  moreActionsStudy = [
    {
      title: StudyDetailsModule.DELETE,
    },
    {
      title: StudyDetailsModule.EXPORT,
    },
  ];
  columnData = [
    {
      key: StudyDetailConstants.TRANSACTIONCODE,
      label: 'Calculation ID',
    },
    {
      key: StudyDetailConstants.STATUS,
      label: 'Status',
    },
    {
      key: StudyDetailConstants.CREATEDAT,
      label: 'Created date',
    },
    {
      key: StudyDetailConstants.UPDATEDAT,
      label: 'Last Updated',
    },
    {
      key: StudyDetailConstants.CREATEDBY,
      label: 'Created by',
    },
    {
      key: StudyDetailConstants.PIPLINERESULT,
      label: 'Pipeline Result',
    },
    {
      key: StudyDetailConstants.TOPSIDERESULT,
      label: 'Topside Result',
    },
  ];

  data: any = [];
  from: string = '';
  studyId: string = '';
  studyCode: string = '';
  studyIdForSearch: string = '';
  list: PageLink[] = [];
  searchList: any = [];
  studyDetail: any;
  suggestionList: any = [];
  suggestionPage = 1;
  suggestionTotal = 1;
  suggestLoading: boolean = false;
  scrollLoading: boolean = false;
  isFoundData: boolean = false;
  lastSearchedTerm: string = '';
  searchInput$ = new Subject<string>();
  Owner: any;
  // canEditStudy: boolean = false;
  canEditStudy: boolean = true;
  hasFullAccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modal: NzModalService,
    private studyDetailsService: StudyDetailsService,
    private alertService: AlertService,
    private globalService: GlobalService,
    private userNameService: UserNameService,
  ) {
    this.Owner = this.globalService.getUserFullName();
    this.hasFullAccess = this.globalService.hasPermissionSync(RoleEnum.FULL_ACCESS);
  }
  // ngOnInit() {
  //   const currentPath = this.router.url;
  //   this.route.queryParamMap.subscribe((params: any) => {
  //     this.from = params.get('from');
  //     this.studyId = params.get('id');
  //   });

  //   if (!this.studyId) {
  //     this.router.navigate(['/page-not-found']);
  //     return;
  //   }

  //   this.studyIdForSearch = this.studyId;
  //   this.list = [
  //     {
  //       page: PAGE_NAME_MAP[this.from] || this.from,
  //       link: `/${this.from}`,
  //     },
  //     {
  //       page: 'Study Detail',
  //       link: '/study-details',
  //       queryParams: {
  //         from: this.from,
  //         id: this.studyId,
  //       },
  //     },
  //   ];

  //   this.getStudyById();
  //   this.getCalculationList();
  //   this.loadingSuggest();
  // }

  ngOnInit() {
    const stored = sessionStorage.getItem('study');
    if (stored) {
      this.studyDetail = JSON.parse(stored);
    } else {
      this.getStudyById();
    }
  }
  onCheckCreateByMe(event: any) {
    const check = event.target.checked;
    const fullName = this.globalService.getUserFullName();
    this.createdBy = check ? fullName : '';
    this.getCalculationList();
  }

  onSearch(value: string) {
    this.searchInput$.next(value);
  }

  loadingSuggest() {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        const trimmed = value.trim();
        if (trimmed === this.lastSearchedTerm) {
          return;
        }
        this.search = trimmed;
        this.lastSearchedTerm = trimmed;
        this.getCalculationListAll();
      });
  }

  onScrollLoad(event: any) {
    if (event && this.suggestionPage <= this.suggestionTotal) {
      this.suggestionPage++;
      this.loadingCalculationListAll();
    }
  }

  onEnterSearch(value: any) {
    if (value) {
      this.search = value;
      this.getCalculationList();
    } else {
      this.search = '';
      this.currentPage = 1;
      this.getCalculationList();
    }
  }

  onSearchValue(data: any) {
    const splitStr = data.split(' - ');
    this.search = splitStr[0]
    this.getCalculationList();
  }

  onSelect(data: any) {
    // console.log(data);
  }

  onChangeStatus(value: any) {
    this.status = value.id;
    this.currentPage = 1;
    this.getCalculationList();
  }

  onSelectMoreAction(data: any) {
    switch (data?.action) {
      case StudyDetailsModule.RECALCULATE:
        this.onRecalculation(data.row);
        break;
      case StudyDetailsModule.EDIT:
        this.onRedirectPage(data.row.transactionId);
        break;
      case StudyDetailsModule.EXPORT:
        this.onExportCalculation(data.row)
        break;
      case StudyDetailsModule.DELETE:
        this.onDeleteTransaction(data.row.transactionId);
        break;
      case StudyDetailsModule.RESUBMIT:
        this.onRecalculation(data.row);
        break;
    }
  }

  onRedirectPage(data: any) {
    const transactionId = typeof data === 'object' ? data.id : data;
    const createdBy = typeof data === 'object' ? data.createdBy : null;
    const study = {
      data: {
        studyId: this.studyDetail.studyId,
        studyCode: this.studyDetail.studyCode,
      },
    };

    const transactionData = {
      data: {
        transactionId: transactionId,
        createdBy: createdBy,
      },
    };

    try {
      sessionStorage.setItem('study', JSON.stringify(study));
      sessionStorage.setItem('transactionId', JSON.stringify(transactionData));
    } catch (err) {
      console.error('[onRedirectPage] session storage error', err);
    }
    this.router.navigate(['/calculation', this.studyDetail?.studyCode]);
  }

  onDeleteTransaction(transactionId: string) {
    const modalRef = this.modal.create({
      nzContent: DeleteCalculationModalComponent,
      nzFooter: null,
      nzWidth: 600,
    });
    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.studyDetailsService.deleteTransaction(transactionId).subscribe({
          next: (response) => {
            const modalTitle =
              AlertMessageCalculationConstants.DELETE_CALCULATION_SUCCESS_TITLE;
            const modalText =
              AlertMessageCalculationConstants.DELETE_CALCULATION_SUCCESS_TEXT;
            this.alertService.success(modalTitle, modalText, true, 3000);
            this.getCalculationList();
            this.getStudyById();
          },
          error: (error) => {
            console.error('Delete failed:', error);
            const modalTitle =
              AlertMessageCalculationConstants.DELETE_CALCULATION_FAILED_TITLE;
            const modalText =
              AlertMessageCalculationConstants.DELETE_CALCULATION_FAILED_TEXT;
            this.alertService.error(modalTitle, modalText, true, 3000);
          },
        });
      }
    });
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
    this.getCalculationList();
  }

  onGoToPage(data: any) {
    if (data >= 1 && data <= this.totalPages && data !== this.currentPage) {
      this.currentPage = data;
      this.getCalculationList();
    }
  }

  onEdit() {
    const modalRef = this.modal.create({
      nzContent: EditStudyModalComponent,
      nzFooter: null,
      nzWidth: 600,

    });
    const instance = modalRef.getContentComponent();
    instance.data = this.studyDetail;
    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.editStudy(result);
      }
    });
  }

  onNewCalculation() {
    const study = {
      data: {
        studyId: this.studyDetail?.studyId,
        studyCode: this.studyDetail?.studyCode,
      },
    };
    sessionStorage.removeItem('transactionId');
    sessionStorage.setItem('study', JSON.stringify(study));
    this.router.navigate(['/calculation', this.studyDetail?.studyCode]);
  }

  displayColorStatus(status: Status): string {
    return colorStatus[status] ?? '#FFFFFF';
  }

  displayStatus(status: Status): string {
    return displayStatus[status] ?? '';
  }

  getStudyById() {
    this.studyDetailsService.getStudyById(this.studyId).subscribe(async (response: any) => {
      try {
        if (response.data) {
          this.studyDetail = {
            studyId: response.data.studyId,
            studyCode: response.data.studyCode,
            studyName: response.data.studyName,
            assetName: response.data.asset,
            locationName: response.data.location,
            status: response.data.status,
            createdBy: response.data.createdBy,
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt
          }
          // this.canEditStudy = this.checkCanEditStudy(response.data.createdBy);
        }
      } catch (error) {
        console.log('error :', error);
      }
    });
  }

  editStudy(data: any) {
    const req = {
      studyId: this.studyId,
      studyName: data.studyName,
      assetId: data.assetId,
      locationId: data.locationId,
    };
    try {
      this.studyDetailsService.editStudy(req).subscribe({
        next: (response) => {
          if (response.data) {
            this.getStudyById();
            const modalTitle = AlertMessageStudyConstants.EDIT_SUCCESS_TITLE;
            const modalText = AlertMessageStudyConstants.EDIT_SUCCESS_TEXT;
            this.alertService.success(modalTitle, modalText, true, 3000);
          }
        },
        error: (error: any) => {
          const modalTitle = AlertMessageStudyConstants.EDIT_FAILED_TITLE;
          const modalText = AlertMessageStudyConstants.EDIT_FAILED_TEXT;
          this.alertService.error(modalTitle, modalText, true, 3000);
        },
      });
    } catch (err) {
      console.error('Failed to get table values for draft', err);
      this.alertService.error(
        'Unexpected error',
        'Could not retrieve table data.',
        true,
        3000,
      );
    }
  }

  getCalculationList() {
    this.isLoading = true;
    const params: any = {
      study_id: this.studyIdForSearch,
      limit: this.itemsPerPage,
      page: this.currentPage,
      order: this.sortDirection,
      created_by: this.createdBy,
      sort: this.mappingKeyStudyDetail(this.sortField as StudyDetailConstants),
      status: this.status,
      search: this.search,
    };
    const searchFound =
      this.search !== '' || this.status !== '' || this.createdBy !== '';
    const req = cleanObject(params);
    this.studyDetailsService.getCalculationList(req).subscribe({
      next: (response) => {
        if (response.data) {
          this.data = response.data;
          this.totalItems = response.total;
          this.totalPages = response.totalPage;
          this.isLoading = false;
        } else {
          this.data = [];
          this.totalItems = response.total;
          this.totalPages = response.totalPage;
          this.isLoading = false;
        }
        this.isFoundData = !searchFound && response?.total === 0 ? true : false;
        this.notFoundText = this.isFoundData
          ? 'No Calculation History'
          : 'No results found';
      },
      error: (error: any) => {
        this.totalItems = 0;
        this.totalPages = 0;
        this.isLoading = false;
        console.log('error', error);
      },
    });
  }

  onRecalculation(data: any) {
    const req = {
      transactionId: data.transactionId,
    };
    this.studyDetailsService.reCalculation(req).subscribe({
      next: (response) => {
        if (response.data) {
          const study = {
            data: {
              studyId: this.studyDetail.studyId,
              studyCode: this.studyDetail.studyCode,
            },
          };
          const transactionData = {
            data: {
              transactionId: response.data.transactionId,
            },
          };
          sessionStorage.setItem(
            'transactionId',
            JSON.stringify(transactionData),
          );
          sessionStorage.setItem('study', JSON.stringify(study));
          this.router.navigate(['/calculation', this.studyDetail.studyCode]);
        }
      },
      error: (error: any) => {
        const modalTitle = AlertMessageStudyConstants.EDIT_FAILED_TITLE;
        const modalText = AlertMessageStudyConstants.EDIT_FAILED_TEXT;
        this.alertService.error(modalTitle, modalText, true, 3000);
      }
    });
  }

  getCalculationListAll() {
    const params: any = {
      limit: 10,
      study_id: this.studyIdForSearch,
      order: this.sortDirection,
      created_by: this.createdBy,
      search: this.search,
    };
    const req = cleanObject(params);
    this.studyDetailsService.getCalculationList(req).subscribe({
      next: (response) => {
        if (response.data) {
          this.searchList = response.data.map((item: any) => ({
            label: `${item.transactionCode} - ${item.createdBy}`,
            transactionCode: item.transactionCode,
            createdBy: item.createdBy,
          }));
          this.suggestionTotal = response.totalPage
        } else {
          this.searchList = [];
        }
      },
      error: (error: any) => {
        console.log('error', error);
      },
    });
  }

  loadingCalculationListAll() {
    this.scrollLoading = true;
    const params: any = {
      limit: 10,
      study_id: this.studyIdForSearch,
      page: this.suggestionPage,
      order: this.sortDirection,
      created_by: this.createdBy,
      search: this.search,
    };
    const req = cleanObject(params);
    this.studyDetailsService.getCalculationList(req).subscribe({
      next: (response) => {
        if (response.data) {
          const load = response.data.map((item: any) => ({
            label: `${item.transactionCode} - ${item.createdBy}`,
            transactionCode: item.transactionCode,
            createdBy: item.createdBy,
          }));
          this.searchList = [...this.searchList, ...load];
        }
        this.suggestionTotal = response.totalPage;
        this.scrollLoading = false;
      },
      error: (error: any) => {
        console.log('error', error);
        this.scrollLoading = false;
      },
    });
  }

  mappingKeyStudyDetail(key: StudyDetailConstants): string {
    return StudyDetailConstantsParam[key] ?? '';
  }

  displayName(name: string) {
    return this.userNameService.displayName(name);
  }

  displayStudyName(name: string) {
    return this.userNameService.displayStudyName(name);
  }

  onDropdownAction(event: any): void {
    switch (event.action) {
      case 'Delete':
        this.onDeleteStudy(event.row);
        break;
      case 'Export':
        break;
      default:
    }
  }

  onDeleteStudy(data: any) {
    const modalRef = this.modal.create({
      nzContent: DeleteStudyModalComponent,
      nzFooter: null,
      nzWidth: 600,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        const req = {
          studyId: this.studyDetail.studyId,
        };
        this.studyDetailsService.deleteStudy(req.studyId).subscribe({
          next: (response) => {
            if (response.data) {
              const study = {
                data: {
                  studyId: this.studyDetail.studyId,
                  studyCode: this.studyDetail.studyCode,
                },
              };
              const transactionData = {
                data: {
                  transactionId: response.data.transactionId,
                },
              };
              sessionStorage.setItem(
                'transactionId',
                JSON.stringify(transactionData),
              );
              sessionStorage.setItem('study', JSON.stringify(study));
              const modalTitle =
                AlertMessageStudyConstants.DELETE_STUDY_SUCCESS_TITLE;
              const modalText =
                AlertMessageStudyConstants.DELETE_STUDY_SUCCESS_TEXT;
              this.alertService.success(modalTitle, modalText, true, 3000);

              this.router.navigate(['/all-studies']);
            }
          },
          error: (error: any) => {
            const modalTitle =
              AlertMessageStudyConstants.DELETE_STUDY_FAILED_TITLE;
            const modalText =
              AlertMessageStudyConstants.DELETE_STUDY_FAILED_TEXT;
            this.alertService.error(modalTitle, modalText, true, 3000);
          },
        });
      }
    });
  }

  // checkCanEditStudy(createdBy: string): boolean {
  //   const currentOwner = this.globalService.getUserFullName();
  //   return createdBy === currentOwner || this.hasFullAccess;
  // }

  onExportCalculation(data: any) {
    const req = {
      study_id: this.studyDetail?.studyId,
      transaction_id: data.transactionId,
    };

    this.studyDetailsService.exportCalculation(req).subscribe({
      next: (response) => {
        if (response?.data) {
          const study = {
            data: {
              studyId: this.studyDetail.studyId,
              studyCode: this.studyDetail.studyCode,
            },
          };
          sessionStorage.setItem('study', JSON.stringify(study));

          const byteCharacters = atob(response.data.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);

          const blob = new Blob(
            [byteArray],
            { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
          );

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = response.data.filename || 'export.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      },
      error: () => {
        const modalTitle = AlertMessageStudyConstants.EDIT_FAILED_TITLE;
        const modalText = AlertMessageStudyConstants.EDIT_FAILED_TEXT;
        this.alertService.error(modalTitle, modalText, true, 3000);
      }
    });
  }

  onItemsPerPageChange(newSize: number) {
    this.itemsPerPage = newSize;
    this.pageSize = newSize;
    this.currentPage = 1;
    this.getCalculationList();
  }

}