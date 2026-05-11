import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  contactName = 'Jon Doe';
  contactEmail = 'JonDoe@gmail.com';
  contactSubject = '';
  contactMessage = '';
  contactMsg = signal('');

  submitContact() {
    if (!this.contactName || !this.contactEmail || !this.contactMessage) return;
    this.contactMsg.set('Thank you! We will get back to you within 24 hours.');
    this.contactSubject = '';
    this.contactMessage = '';
  }
}
