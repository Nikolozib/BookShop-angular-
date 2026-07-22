import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactName = '';
  contactEmail = '';
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
