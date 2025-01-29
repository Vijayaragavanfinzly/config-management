import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SyncDialogComponent } from '../miscellaneous/dialogs/sync-dialog/sync-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CompareService } from '../../services/compare-service/compare.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExportService } from '../../services/export-service/export.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SuccessSnackbarComponent } from '../miscellaneous/snackbar/success-snackbar/success-snackbar.component';
import { ErrorSnackbarComponent } from '../miscellaneous/snackbar/error-snackbar/error-snackbar.component';
import { SpinnerComponent } from "../miscellaneous/spinner/spinner.component";
import { SyncDialogExportComponent } from '../miscellaneous/dialogs/sync-dialog-export/sync-dialog-export.component';
import { SyncSnackbarComponent } from '../miscellaneous/snackbar/sync-snackbar/sync-snackbar.component';

@Component({
  selector: 'app-sync',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTooltipModule, SpinnerComponent],
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
  showHint: boolean = false;
  loading: boolean = false;
  showSidebar = false;
  isLoading: boolean = false;

  constructor(private dialog: MatDialog, private compareService: CompareService, private snackBar: MatSnackBar, private exportService: ExportService, private router: Router) { }

  ngOnInit(): void {

    this.getLastSyncDate();
    this.getAllSyncDetails();
    this.showOverlay();
    this.showHint = true;
    setTimeout(() => {
      this.showHint = false;
    }, 10000); // 10 seconds
  }

  getLastSyncDate() {
    this.compareService.getLastSyncDate().subscribe({
      next: (data) => {
        console.log(data);

        if (data.statusCode == 200) {
          this.lastSyncTime = data.data
        }
      },
      error: (err) => {
        console.log(err);

      }
    });
  }

  getAllSyncDetails() {
    this.compareService.getAllSyncDetails().subscribe({
      next: (data) => {
        if (data.statusCode == 200) {
          this.syncData = data.data;
          console.log(this.syncData);

        }
      },
      error: (err) => {
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
    const dialogRef = this.dialog.open(SyncDialogComponent, {
      width: '600px',
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.isLoading = true;
        const inProgressSnackbar = this.snackBar.openFromComponent(SyncSnackbarComponent, {
          data: {
            message: 'Sync in progress...',
            icon: 'spinner'
          },
          duration: 0,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.compareService.sync().subscribe({
          next: (data) => {
            console.log(data);
            inProgressSnackbar.dismiss();
            this.isLoading = false;

            if (data) {
              this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                data: {
                  message: `Sync Successful!`,
                  icon: 'check-circle'
                },
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            }
            this.getAllSyncDetails();
          },
          error: (err) => {
            inProgressSnackbar.dismiss();
            this.isLoading = false;
            this.snackBar.openFromComponent(ErrorSnackbarComponent, {
              data: {
                message: `Sync process failed`,
                icon: 'check-circle'
              },
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        })
      }
    });
  }
  syncEnvironment(env: string) {

    this.exportService.isAnyDataModifiedForEnv(env).subscribe({
      next: (res) => {
        if (res.statusCode == 200 && res.message == 'success') {
          const dialogRef = this.dialog.open(SyncDialogExportComponent, {
            width: '600px',
            data: { env },
          });
          dialogRef.afterClosed().subscribe((action) => {
            if (action === 'export') {
              console.log('User chose to export data.');
              this.exportService.exportSpecifiedEnv(env).subscribe({
                next: (blob) => {
                  console.log(blob);

                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${env}_updated_properties.sql`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                  this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                    data: {
                      message: `Export Successful`,
                      icon: 'check-circle'
                    },
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                  });
                },
                error: (err) => {
                  console.error("Error exporting properties:", err);
                  this.snackBar.openFromComponent(ErrorSnackbarComponent, {
                    data: {
                      message: `Export Failed`,
                      icon: 'check-circle'
                    },
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                  });
                },
                complete: () => {
                },
              })
            } else if (action === 'override') {
              console.log('User chose to override and sync.');
              this.loading = true;
              this.compareService.syncEnvironment(env).subscribe({
                next: (res) => {
                  console.log(res);
                  if (res.statusCode == 200) {
                    this.loading = false;
                    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                      data: {
                        message: `Sync Done Successfully for ${env}!`,
                        icon: 'check-circle'
                      },
                      duration: 3000,
                      horizontalPosition: 'center',
                      verticalPosition: 'top',
                    });

                    this.getAllSyncDetails();
                  }
                },
                error: (err) => {
                  console.log(err);
                  this.loading = false;
                }
              })
            } else {
              console.log('User canceled the action.');
            }
          });
        }
        else {
          const dialogRef = this.dialog.open(SyncDialogComponent, {
            width: '600px',
          });
          dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
              this.loading = true;
              this.compareService.syncEnvironment(env).subscribe({
                next: (res) => {
                  console.log(res);
                  if (res.statusCode == 200) {
                    this.loading = false;
                    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                      data: {
                        message: `Sync Done Successfully for ${env}!`,
                        icon: 'check-circle'
                      },
                      duration: 3000,
                      horizontalPosition: 'center',
                      verticalPosition: 'top',
                    });

                    this.getAllSyncDetails();
                  }
                },
                error: (err) => {
                  console.log(err);
                  this.loading = false;
                }
              })
            }
          });
        }
      },
      error: (err) => {

      }
    });



  }


  exportSingleUpdateQuery(env: string) {
    this.exportService.isAnyDataModifiedForEnv(env).subscribe({
      next: (res) => {
        console.log(res);
        if (res.statusCode == 200 && res.message == 'success') {
          this.exportService.exportSpecifiedEnv(env).subscribe({
            next: (blob) => {
              console.log(blob);

              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${env}_updated_properties.sql`;
              a.click();
              window.URL.revokeObjectURL(url);
              this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                data: {
                  message: `Export Successful`,
                  icon: 'check-circle'
                },
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            },
            error: (err) => {
              console.error("Error exporting properties:", err);
              this.snackBar.openFromComponent(ErrorSnackbarComponent, {
                data: {
                  message: `Export Failed`,
                  icon: 'check-circle'
                },
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            },
            complete: () => {
            },
          })
        }
        else {
          this.snackBar.openFromComponent(ErrorSnackbarComponent, {
            data: {
              message: `You cannot export because no edit, delete, or add operations have been performed.`,
              icon: 'check-circle'
            },
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      }
    })
  }

  showOverlay(): void {
    this.showOverlayHint = true;
  }

  hideOverlay(): void {
    this.router.navigate(['faq/sync-guide']);
    this.showOverlayHint = false;
  }

  toggleInfoSidebar() {
    this.showSidebar = !this.showSidebar;
  }
}
