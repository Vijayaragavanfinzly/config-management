import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PropertyDialogComponent } from '../edit-property-dialog/edit-property-dialog.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-update-compare-property-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatDialogModule,
    MatFormFieldModule],
  templateUrl: './update-compare-property-dialog.component.html',
  styleUrl: './update-compare-property-dialog.component.css'
})
export class UpdateComparePropertyDialogComponent {
  propertyForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { propertyKey: string; propertyValue: string; tenant:string; environment:string; }
  ) {
    this.propertyForm = this.fb.group({
      environment: [{ value: data.environment, disabled: true }, Validators.required],
      tenant: [{ value: data.tenant, disabled: true }, Validators.required],
      propertyKey: [{ value: data.propertyKey, disabled: true },, Validators.required],
      propertyValue: [data.propertyValue, Validators.required],
    });
  }
  save() {
    if (this.propertyForm.valid) {
      this.dialogRef.close(this.propertyForm.value);
    }
  }
  close() {
    this.dialogRef.close();
  }
}
