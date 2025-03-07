import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { SyncDialogComponent } from '../miscellaneous/dialogs/sync-dialog/sync-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CompareService } from '../../services/compare-service/compare.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(private router:Router,private dialog:MatDialog,private http:HttpClient,private compareService:CompareService,private snackBar: MatSnackBar){

  }
  

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
    if(event.altKey && (event.key === 't' || event.key === 'T')){
      event.preventDefault();
      this.router.navigate(['/tenants']);
    }
    if(event.altKey && (event.key === 'c' || event.key === 'C')){
      event.preventDefault();
      this.router.navigate(['/compare']);
    }
    if(event.altKey && (event.key === 'X' || event.key === 'x')){
      event.preventDefault();
      this.router.navigate(['/clone']);
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


  openSyncDialog(): void {
    const dialogRef = this.dialog.open(SyncDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.callSyncApi();
      }
    });
  }

  callSyncApi(): void {
    this.compareService.sync().subscribe({
      next:(data)=>{
        console.log(data);
        
        if(data === "success"){
          this.snackBar.open('Sync Successful', 'Close', {
            duration: 3000,
            panelClass: ['custom-toast', 'toast-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      },
      error:(err)=>{
        this.snackBar.open('Sync process failed', 'Close', {
          duration: 3000,
          panelClass: ['custom-toast', 'toast-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    })
    // this.http.post('/save/sync', {}).subscribe({
    //   next: () => alert('Sync successful!'),
    //   error: err => alert('Sync failed: ' + err.message)
    // });
  }

}
