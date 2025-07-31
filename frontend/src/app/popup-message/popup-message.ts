import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-message.html',
  styleUrls: ['./popup-message.css']
})
export class PopupMessageComponent implements OnInit {
  @Input() message = '';
  @Input() type: 'success' | 'error' | 'info' = 'info';
  show = false;

  ngOnInit() {
    console.log('Popup message:', this.message);
    console.log('Popup type:', this.type);
    // Show immediately after component initializes
    setTimeout(() => this.show = true, 10);
    // Hide after 3 seconds
    setTimeout(() => this.show = false, 3000);
  }
}
