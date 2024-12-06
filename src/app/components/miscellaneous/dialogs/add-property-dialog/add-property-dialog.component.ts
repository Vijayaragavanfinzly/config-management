import { Component } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-property-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatDialogModule,
    MatFormFieldModule,],
  templateUrl: './add-property-dialog.component.html',
  styleUrl: './add-property-dialog.component.css'
})
export class AddPropertyDialogComponent {
  propertyForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { environment: string; tenant: string }
  ) {
    this.propertyForm = this.fb.group({
      environment: [{ value: data.environment, disabled: true }, Validators.required],
      tenant: [{ value: data.tenant, disabled: true }, Validators.required],
      propertyKey: ['', Validators.required],
      propertyValue: ['', Validators.required],
    });
  }

  onSave(): void {
    this.dialogRef.close(this.propertyForm.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
