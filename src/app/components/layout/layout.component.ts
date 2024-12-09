import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

interface Theme {
  buttonColor: string;
  backgroundColor: string;
}


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive, MatButtonModule, MatExpansionModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {

  isDropdownClicked = false;

  isSidebarCollapsed :Boolean = false;

  
  

  themes: Record<string, Theme> = {
    red: {
      buttonColor: 'btn-danger',
      backgroundColor: '#ffcccc',
    },
    green: {
      buttonColor: 'btn-success',
      backgroundColor: '#ccffcc',
    },
    blue: {
      buttonColor: 'btn-primary',
      backgroundColor: '#ccccff',
    },
    gray: {
      buttonColor: 'btn-secondary',
      backgroundColor: '#e0e0e0',
    },
    black: {
      buttonColor: 'btn-dark',
      backgroundColor: '#333333',
    },
    cyan: {
      buttonColor: 'btn-info',
      backgroundColor: '#17a2b8',
    },
    yellow: {
      buttonColor: 'btn-warning',
      backgroundColor: '#ffc107',
    },
    white: {
      buttonColor: 'btn-light',
      backgroundColor: '#ffffff',
    },
  };

  currentTheme = this.themes['gray'];

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('selectedTheme');
    const collapsedState = localStorage.getItem("isSideBarCollapsed");
    this.isSidebarCollapsed = collapsedState === "true";
    if (savedTheme && this.themes[savedTheme]) {
      this.applyTheme(savedTheme);
    }
  }

  @HostListener('window:keydown',['$event'])
  handleKeyoardToggle(event: KeyboardEvent){
    if(event.altKey && event.key === '1'){
      event.preventDefault();
      this.toggleSidebar();
    }
  }


  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    localStorage.setItem("isSideBarCollapsed", this.isSidebarCollapsed.toString());
  }

  changeTheme(theme: string): void {
    if (this.themes[theme]) {
      this.currentTheme = this.themes[theme];
      document.body.className = ''; // Reset all existing theme classes
      document.body.classList.add(`${theme}-theme`);
      localStorage.setItem('selectedTheme', theme); // Save theme to local storage
      document.documentElement.style.setProperty('--primary-color', theme);

      // Close the dropdown and reset the chevron
      this.isDropdownClicked = false;
    }
  }

  applyTheme(theme: string): void {
    this.currentTheme = this.themes[theme];
    document.body.className = ''; // Reset all existing theme classes
    document.body.classList.add(`${theme}-theme`);
  }

  toggleChevron(event: Event): void {
    event.preventDefault();
    this.isDropdownClicked = !this.isDropdownClicked;
  }


}
