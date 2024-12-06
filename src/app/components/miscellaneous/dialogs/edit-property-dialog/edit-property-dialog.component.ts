import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-property-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatDialogModule,
    MatFormFieldModule,],
  templateUrl: './edit-property-dialog.component.html',
  styleUrl: './edit-property-dialog.component.css'
})
export class PropertyDialogComponent {
  propertyForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { propertyKey: string; propertyValue: string; id:number; tenant:string; environment:string; }
  ) {
    this.propertyForm = this.fb.group({
      environment: [{ value: data.environment, disabled: true }, Validators.required],
      tenant: [{ value: data.tenant, disabled: true }, Validators.required],
      propertyKey: [data.propertyKey, Validators.required],
      propertyValue: [data.propertyValue, Validators.required],
      id: [data.id,Validators.required]
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
