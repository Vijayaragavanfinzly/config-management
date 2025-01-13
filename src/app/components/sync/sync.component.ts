import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SyncDialogComponent } from '../miscellaneous/dialogs/sync-dialog/sync-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CompareService } from '../../services/compare-service/compare.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sync',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sync.component.html',
  styleUrl: './sync.component.css'
})
export class SyncComponent implements OnInit {
  lastSyncDate: Date = new Date();
  isSyncing: boolean = false;
  syncProgress: number = 0;

  showOverlayHint: boolean = true;

  constructor(private dialog: MatDialog, private compareService: CompareService, private snackBar: MatSnackBar) { }

  ngOnInit(): void { }

  startSync(): void {
    this.isSyncing = true;
    this.syncProgress = 0;

    const interval = setInterval(() => {
      this.syncProgress += 10;
      if (this.syncProgress >= 100) {
        clearInterval(interval);
        this.isSyncing = false;
        this.lastSyncDate = new Date();
        this.callSyncApi();
      }

    }, 300);
  }

  callSyncApi(): void {
    this.compareService.sync().subscribe({
      next: (data) => {
        console.log(data);

        if (data === "success") {
          this.snackBar.open('Sync Successful', 'Close', {
            duration: 3000,
            panelClass: ['custom-toast', 'toast-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      },
      error: (err) => {
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

  hideOverlay(): void {
    this.showOverlayHint = false;
  }

}
