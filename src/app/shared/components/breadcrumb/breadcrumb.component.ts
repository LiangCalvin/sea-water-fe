import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { PageLink } from '../../models/id-name.model';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, NzBreadCrumbModule, NzIconModule, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})


export class BreadcrumbComponent {
  @Input() list: PageLink[] = []

}
