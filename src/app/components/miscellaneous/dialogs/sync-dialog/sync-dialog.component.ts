import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-sync-dialog',
  standalone: true,
  imports: [],
  templateUrl: './sync-dialog.component.html',
  styleUrl: './sync-dialog.component.css'
})
export class SyncDialogComponent {
  constructor(public dialogRef: MatDialogRef<SyncDialogComponent>) {}
      onConfirm(): void {
        this.dialogRef.close(true);
      }
    
      onCancel(): void {
        this.dialogRef.close(false);
      }
}
