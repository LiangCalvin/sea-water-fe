import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';

export type TemplateTypeMap = {
  loading: {};                               
  scrollLoading: { loading: boolean };
  loadingSmall: {};
  loadingSmallNoText: {};
  dataNotFound: { text: string };
  deleteTaskContentModal: {};
  discardChangesModal: {};
  confirmDeleteModal: { text: string };
  popupBlockerWarningModal: {};
};

@Component({
  selector: 'app-global-template',
  imports: [NzIconModule, NzSpinModule, NzEmptyModule],
  templateUrl: './global-template.component.html',
  styleUrls: ['./global-template.component.scss'],
})
export class GlobalTemplateComponent {
  @ViewChild('loading', { static: true })
  loading!: TemplateRef<TemplateTypeMap['loading']>;
  
  @ViewChild('scrollLoading', { static: true })
  scrollLoading!: TemplateRef<TemplateTypeMap['scrollLoading']>;
  
  @ViewChild('loadingSmall', { static: true })
  loadingSmall!: TemplateRef<TemplateTypeMap['loadingSmall']>;
  
  @ViewChild('loadingSmallNoText', { static: true })
  loadingSmallNoText!: TemplateRef<TemplateTypeMap['loadingSmallNoText']>;
  
  @ViewChild('dataNotFound', { static: true })
  dataNotFound!: TemplateRef<TemplateTypeMap['dataNotFound']>;
  
  @ViewChild('deleteTaskContentModal', { static: true })
  deleteTaskContentModal!: TemplateRef<TemplateTypeMap['deleteTaskContentModal']>;
  
  @ViewChild('discardChangesModal', { static: true })
  discardChangesModal!: TemplateRef<TemplateTypeMap['discardChangesModal']>;
  
  @ViewChild('confirmDeleteModal', { static: true })
  confirmDeleteModal!: TemplateRef<TemplateTypeMap['confirmDeleteModal']>;
  
  @ViewChild('popupBlockerWarningModal', { static: true })
  popupBlockerWarningModal!: TemplateRef<TemplateTypeMap['popupBlockerWarningModal']>;
}
