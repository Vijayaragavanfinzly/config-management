import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SyncDialogComponent } from '../miscellaneous/dialogs/sync-dialog/sync-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CompareService } from '../../services/compare-service/compare.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExportService } from '../../services/export-service/export.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-sync',
  standalone: true,
  imports: [CommonModule, RouterModule,MatTooltipModule],
  templateUrl: './sync.component.html',
  styleUrl: './sync.component.css'
})
export class SyncComponent implements OnInit {
  lastSyncDate: Date = new Date();
  isSyncing: boolean = false;
  syncProgress: number = 0;
  syncData: any[] = [];
  showOverlayHint: boolean = true;
  lastSyncTime: string = '';
  constructor(private dialog: MatDialog, private compareService: CompareService, private snackBar: MatSnackBar,private exportService:ExportService) { }

  ngOnInit(): void {
    this.compareService.getLastSyncDate().subscribe({
      next:(data)=>{
        console.log(data);
        
        if(data.statusCode == 200){
          this.lastSyncTime = data.data
        }
      },
      error:(err)=>{
        console.log(err);
        
      }
    });
    this.compareService.getAllSyncDetails().subscribe({
      next:(data)=>{
        if(data.statusCode == 200){
          this.syncData = data.data;
          console.log(this.syncData);
          
        }
      },
      error:(err)=>{
        console.log(err);
        
      }
    })
   }

   isRecentSync(lastSyncedTime: string): boolean {
    const lastSync = new Date(lastSyncedTime);
    const currentTime = new Date();
    const differenceInHours = (currentTime.getTime() - lastSync.getTime()) / (1000 * 3600);
    return differenceInHours <= 24;
  }

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

        if (data) {
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
  syncEnvironment(env:string){
    this.compareService.syncEnvironment(env).subscribe({
      next:(res)=>{
        console.log(res);
        if(res.statusCode == 200){
          this.snackBar.open(`Sync Done Successfull! for ${env}`, 'Close', {
            duration: 3000,
            panelClass: ['custom-toast', 'toast-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      },
      error:(err)=>{
        console.log(err);
        
      }
    })
  }

  exportUpdateQuery(){
    this.exportService.exportUpdateQueryForAll().subscribe({
      next: (blob) => {
        console.log(blob);
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `update_query_properties.sql`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Exported Successfully!', 'Close', {
          duration: 3000,
          panelClass: ['custom-toast', 'toast-success'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error("Error exporting properties:", err);
        this.snackBar.open('Export failed.', 'Close', {
          duration: 3000,
          panelClass: ['custom-toast', 'toast-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      complete: () => {
      },
    })
  }

  hideOverlay(): void {
    this.showOverlayHint = false;
  }

}
