import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [RouterModule,MatInputModule,MatButtonModule,MatDialogModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})
export class ConfirmationDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {}
  onConfirm(): void {
    this.dialogRef.close(true); // Close and pass true to confirm
  }

  onCancel(): void {
    this.dialogRef.close(false); // Close and pass false to cancel
  }
}
