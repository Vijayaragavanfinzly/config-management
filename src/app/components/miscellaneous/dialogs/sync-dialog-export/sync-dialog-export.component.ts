import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-sync-dialog-export',
  standalone: true,
  imports: [],
  templateUrl: './sync-dialog-export.component.html',
  styleUrl: './sync-dialog-export.component.css'
})
export class SyncDialogExportComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { env: string },
    private dialogRef: MatDialogRef<SyncDialogExportComponent>
  ) {}

  closeDialog(action: 'cancel' | 'export' | 'override') {
    this.dialogRef.close(action); // Return the selected action
  }
}