import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-compare-property-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,CommonModule],
  templateUrl: './compare-property-dialog.component.html',
  styleUrl: './compare-property-dialog.component.css'
})
export class ComparePropertyDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ComparePropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  close(action: string): void {
    this.dialogRef.close(action);
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
  getKeys(data: any): string[] {
    return Object.keys(data);
  }

}
