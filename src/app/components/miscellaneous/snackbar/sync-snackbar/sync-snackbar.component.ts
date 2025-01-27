import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { SuccessSnackbarComponent } from '../success-snackbar/success-snackbar.component';

@Component({
  selector: 'app-sync-snackbar',
  standalone: true,
  imports: [],
  templateUrl: './sync-snackbar.component.html',
  styleUrl: './sync-snackbar.component.css'
})
export class SyncSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
    private snackBarRef: MatSnackBarRef<SuccessSnackbarComponent>) {}
  
    getIconClass() {
      return `fas fa-${this.data.icon}`;
    }
    closeSnackBar() {
      this.snackBarRef.dismiss();
    }
}
