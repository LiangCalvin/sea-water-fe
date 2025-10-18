import { inject, Injectable } from '@angular/core';
import { EnvironmentConfigurationService } from '../environment-configuration.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../../core/models/recommendation/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private envConfigService = inject(EnvironmentConfigurationService);
  private http = inject(HttpClient);
  // private readonly BASE_URL = this.envConfigService.getBaseUrl();
  private BASE_URL = 'http://localhost:3000'; 
  constructor() { }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.BASE_URL}/messages`);
  }

  sendMessage(data: Message): Observable<Message> {
    return this.http.post<Message>(`${this.BASE_URL}/messages`, data);
  }
  //   getMessages(): Observable<Message> {
  //   return this.http.get<Message>("http://localhost:3000/api/messages");
  // }


}
