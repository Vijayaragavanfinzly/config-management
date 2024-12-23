import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  themes = [
    { name: 'Dark Theme', color: '#2b2b2b' },
    { name: 'Light Theme', color: '#f5f5f5' },
    { name: 'Blue Theme', color: '#3b5998' },
    { name: 'Green Theme', color: '#4caf50' },
    { name: 'Red Theme', color: '#f44336' }
  ];

  selectTheme(theme: { name: string; color: string }) {
    alert(`Selected Theme: ${theme.name}`);
    // Apply theme logic here
    document.body.style.backgroundColor = theme.color;
  }

  setTheme(themeClass: string) {
    const body = document.body;

    // Remove existing theme classes
    body.classList.remove('theme-ocean', 'theme-forest', 'theme-retro');

    // Add the selected theme class
    if (themeClass !== 'default') {
      body.classList.add(themeClass);
    }
  }
}
