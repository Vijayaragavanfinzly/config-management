import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-compare',
  standalone: true,
  imports: [FormsModule,MatFormFieldModule,ReactiveFormsModule,MatInputModule,MatButtonModule,MatDialogModule,CommonModule],
  templateUrl: './edit-compare.component.html',
  styleUrl: './edit-compare.component.css'
})
export class EditCompareComponent {
  tenantForm: FormGroup
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditCompareComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {propertyKey:string;tenantEnv:string;value:string}

  ) {
    this.tenantForm = this.fb.group({
      propertykey: [{ value: data.propertyKey, disabled: true }, Validators.required],
      tenantEnv: [{ value: data.tenantEnv, disabled: true }, Validators.required],
      value: [data.value, Validators.required],
    });
   }

  save(): void {
    const formData = {
      ...this.tenantForm.getRawValue(),
    };
    this.dialogRef.close(formData);
  }
  onCancel(): void {
    this.dialogRef.close();
  }
}
