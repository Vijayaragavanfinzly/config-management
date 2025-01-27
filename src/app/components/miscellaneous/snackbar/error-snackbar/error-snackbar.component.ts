import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-error-snackbar',
  standalone: true,
  imports: [],
  templateUrl: './error-snackbar.component.html',
  styleUrl: './error-snackbar.component.css'
})
export class ErrorSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
    private snackBarRef: MatSnackBarRef<ErrorSnackbarComponent>) {}
  
    getIconClass() {
      return `fas fa-times-circle`;
    }
    closeSnackBar() {
      this.snackBarRef.dismiss();
    }
}
