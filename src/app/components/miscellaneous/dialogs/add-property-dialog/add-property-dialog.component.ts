import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-add-property-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatDialogModule,
    MatFormFieldModule,NgSelectComponent,FormsModule,MatOptionModule,MatSelectModule,NgxMatSelectSearchModule],
  templateUrl: './add-property-dialog.component.html',
  styleUrl: './add-property-dialog.component.css'
})
export class AddPropertyDialogComponent implements OnInit{
  propertyForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { application ?: string[]; configId?:string; env?:string; fieldGroup?: string[],target?:string[],type?:string[],id?:string;
      isEdit?:string;label?:string;profile?:string;propKey?:string;propertyType?:string;secret?:string;tenant?:string;tenantEnvId?:string;value?:string;
     }
  ) {
    this.propertyForm = this.fb.group({
      env: [{ value: data.env, disabled: true }, Validators.required],
      tenant: [{ value: data.tenant, disabled: true }, Validators.required],
      propKey: ['', Validators.required],
      value: ['', Validators.required],
      application:['',Validators.required],
      fieldGroup:['',Validators.required],
      propertyType:['',Validators.required],
      label:['',Validators.required],
    });
  }

  selectedApplication: string | null = null;
  searchInput = new FormControl('');



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
