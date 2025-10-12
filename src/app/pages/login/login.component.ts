import { Component, inject } from '@angular/core';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  protected globalService = inject(GlobalService);
}
