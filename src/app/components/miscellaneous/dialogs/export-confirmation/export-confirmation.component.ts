import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-export-confirmation',
  standalone: true,
  imports: [RouterModule,MatInputModule,MatButtonModule,MatDialogModule],
  templateUrl: './export-confirmation.component.html',
  styleUrl: './export-confirmation.component.css'
})
export class ExportConfirmationComponent {
  constructor(public dialogRef: MatDialogRef<ExportConfirmationComponent>) {}
    onConfirm(): void {
      this.dialogRef.close(true);
    }
  
    onCancel(): void {
      this.dialogRef.close(false);
    }
}
