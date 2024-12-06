import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-confirm-copy-property-dialog',
  standalone: true,
  imports: [RouterModule, MatInputModule, MatButtonModule, MatDialogModule],
  templateUrl: './confirm-copy-property-dialog.component.html',
  styleUrl: './confirm-copy-property-dialog.component.css'
})
export class ConfirmCopyPropertyDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmCopyPropertyDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }


  onConfirm(): void {
    this.dialogRef.close(true); // Close and pass true to confirm
  }

  onCancel(): void {
    this.dialogRef.close(false); // Close and pass false to cancel
  }
}
