import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-success-snackbar',
  standalone: true,
  imports: [],
  templateUrl: './success-snackbar.component.html',
  styleUrl: './success-snackbar.component.css'
})
export class SuccessSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
  private snackBarRef: MatSnackBarRef<SuccessSnackbarComponent>) {}

  getIconClass() {
    return `fas fa-${this.data.icon}`;
  }
  closeSnackBar() {
    this.snackBarRef.dismiss();
  }
}
