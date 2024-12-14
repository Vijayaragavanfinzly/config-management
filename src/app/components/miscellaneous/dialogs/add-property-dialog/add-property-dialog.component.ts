import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-add-property-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatDialogModule,
    MatFormFieldModule,NgSelectComponent],
  templateUrl: './add-property-dialog.component.html',
  styleUrl: './add-property-dialog.component.css'
})
export class AddPropertyDialogComponent implements OnInit{
  propertyForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { environment: string; tenant: string;applications: string[]; fieldGroups: string[],target:string[],type:string[] }
  ) {
    this.propertyForm = this.fb.group({
      environment: [{ value: data.environment, disabled: true }, Validators.required],
      tenant: [{ value: data.tenant, disabled: true }, Validators.required],
      propertyKey: ['', Validators.required],
      propertyValue: ['', Validators.required],
      application:['',Validators.required],
      fieldGroup:['',Validators.required],
      target:['',Validators.required],
      type:['',Validators.required]
    });
  }



  ngOnInit(): void {
    // this.dialogRef.updateSize("1200px","700px");
  }


  onSave(): void {
    this.dialogRef.close(this.propertyForm.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  onFieldBlur(fieldName: string): void {
    const control = this.propertyForm.get(fieldName);
    if (control) {
      control.markAsTouched();
    }
  }
}
