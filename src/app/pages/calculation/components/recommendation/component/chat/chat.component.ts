import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Message } from '../../../../../../core/models/recommendation/chat.model';
import { ChatService } from '../../../../../../services/chat/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Pusher from 'pusher-js';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})

export class ChatComponent implements OnInit {
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  messages: Message[] = [];
  currentMessage = '';
  isConnectPTTEP = false;
  isLoading = false;
  selectedFiles: File[] = [];
  username = 'username';
  message = '';
  
  constructor(
    private chatService: ChatService,
    private http: HttpClient

  ) { }

  ngOnInit(): void {
    this.loadMessages();
        // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    const pusher = new Pusher('82571582980be44b96ec', {
      cluster: 'ap1'
    });

    const channel = pusher.subscribe('chat');
    channel.bind('message', (data : any) => {
      // alert(JSON.stringify(data));
      this.messages.push(data);
    });
  }

  // submit(): void {
  //   this.http.post('http://localhost:3000/api/messages', 
  //     {
  //       username: this.username,
  //       message: this.message
  //     }
  //   ).subscribe((res)=> this.message)
  // }
// submit(): void {
//   if (!this.message.trim()) return; // prevent sending empty message

//   const msg = {
//     id: crypto.randomUUID(),     // generate unique ID on frontend
//     content: this.message.trim(),
//     isUser: true,
//     timestamp: new Date()
//   };

//   this.chatService.sendMessage(msg).subscribe({
//     next: (response) => {
//       console.log('Message sent:', response);
//       this.message = ''; // clear input box
//     },
//     error: (err) => console.error('Send error:', err)
//   });
// }

  loadMessages() {
  this.chatService.getMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
        this.scrollToBottom();
      },
      error: (error) => console.error('Error loading messages:', error)
    });
  }

  // sendMessage() {
  //   console.log("send")
  //   // if (!this.currentMessage.trim() && this.selectedFiles.length === 0) {
  //   //   return;
  //   // }

  //   const newMessage: Message = {
  //     id: this.generateId(),
  //     content: this.message.trim(),
  //     isUser: true,
  //     timestamp: new Date(),
  //     connectPTTEP: this.isConnectPTTEP ? true : undefined
  //   };

  //   // Add user message immediately
  //   this.messages.push(newMessage);
  //   this.scrollToBottom();

  //   // const messageToSend = {
  //   //   content: this.currentMessage,
  //   //   connectPTTEP: this.isConnectPTTEP,
  //   // };

  //   this.isLoading = true;
  //   this.currentMessage = '';
  //   this.selectedFiles = [];

  //   this.chatService.sendMessage(newMessage).subscribe({
  //     next: (response) => {
  //       this.messages.push({
  //         id: this.generateId(),
  //         content: response.content,
  //         isUser: false,
  //         timestamp: new Date()
  //       });
  //       this.isLoading = false;
  //       this.scrollToBottom();
  //     },
  //     error: (error) => {
  //       console.error('Error sending message:', error);
  //       this.isLoading = false;
  //     }
  //   });
  // }
sendMessage() {
  if (!this.message.trim()) return; // no empty messages

  const newMessage: Message = {
    id: this.generateId(),
    content: this.message.trim(),
    isUser: true,
    timestamp: new Date(),
    connectPTTEP: this.isConnectPTTEP ? true : undefined
  };

  // this.messages.push(newMessage);
  this.scrollToBottom();

  this.isLoading = true;
  this.message = '';

  this.chatService.sendMessage(newMessage).subscribe({
    next: (response) => {
      // this.messages.push({
      //   id: this.generateId(),
      //   content: response.content,
      //   isUser: false,
      //   timestamp: new Date(),
      //   connectPTTEP: response.connectPTTEP ?? false
      // });
      this.isLoading = false;
      this.scrollToBottom();
    },
    error: (error) => {
      console.error('Error sending message:', error);
      this.isLoading = false;
    }
  });
}

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  togglePTTEP() {
    this.isConnectPTTEP = !this.isConnectPTTEP;
  }

  newChat() {
    if (confirm('Start a new chat? Current conversation will be cleared.')) {
      this.messages = [];
      this.currentMessage = '';
      this.selectedFiles = [];
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
