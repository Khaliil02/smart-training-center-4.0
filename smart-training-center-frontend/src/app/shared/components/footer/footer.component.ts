import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="app-footer">
      <span>Smart Training Center 4.0 &copy; {{ currentYear }} - GOOD GOV IT</span>
    </footer>
  `,
  styles: [`
    .app-footer {
      padding: 16px 24px;
      text-align: center;
      color: #666;
      font-size: 13px;
      border-top: 1px solid #e0e0e0;
      background: white;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
