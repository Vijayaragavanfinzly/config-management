import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-add-environment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './add-environment-dialog.component.html',
  styleUrl: './add-environment-dialog.component.css'
})
export class AddEnvironmentDialogComponent {
  tenantForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEnvironmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tenant?: string; tenant_name?: string;environment?:string;release?:string; }
  ) {
    this.tenantForm = this.fb.group({
      tenant: ['', Validators.required],
      tenant_name: ['', Validators.required],
      environment:['',Validators.required],
      release:['',Validators.required]

    });
    if (data?.tenant) {
      this.tenantForm.patchValue({ tenant: data.tenant });
      this.tenantForm.get('tenant')?.disable();
    }
    if (data?.tenant_name) {
      this.tenantForm.patchValue({ tenant_name: data.tenant_name });
      this.tenantForm.get('tenant_name')?.disable();
    }
    if (data?.release) {
      this.tenantForm.patchValue({ tenant_name: data.tenant_name });
      this.tenantForm.get('tenant_name')?.disable();
    }


  }

  

  onSave(): void {
    const formData = {
      ...this.tenantForm.getRawValue(),
    };
    this.dialogRef.close(formData);
  }
  onCancel(): void {
    this.dialogRef.close();
  }
}
