import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-add-tenant-dialog',
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
  templateUrl: './add-tenant-dialog.component.html',
  styleUrls: ['./add-tenant-dialog.component.css'],
})
export class AddTenantDialogComponent {
  tenantForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddTenantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tenant?: string; tenant_name?: string;applications?: string[]; field_groups?: string[],application?:string; fieldGroup?:string }
  ) {
    this.tenantForm = this.fb.group({
      tenant: ['', Validators.required],
      environment: ['', Validators.required],
      tenant_name: ['', Validators.required],
      application: [data?.application || '', Validators.required],
      field_group: [data?.fieldGroup || '', Validators.required],
    });
    if (data?.tenant) {
      this.tenantForm.patchValue({ tenant: data.tenant });
      this.tenantForm.get('tenant')?.disable();
    }
    if (data?.tenant_name) {
      this.tenantForm.patchValue({ tenant_name: data.tenant_name });
      this.tenantForm.get('tenant_name')?.disable();
    }
  }
  ngOnInit(): void {
    console.log(this.data);
    if (this.data?.application) {
      this.tenantForm.patchValue({ application: this.data.application });
    }
    if (this.data?.fieldGroup) {
      this.tenantForm.patchValue({ field_group: this.data.fieldGroup });
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