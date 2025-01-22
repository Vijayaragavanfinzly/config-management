import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; // Import MatSelectModule
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatOptionModule } from '@angular/material/core';


@Component({
  selector: 'edit-property-compare',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatDialogModule,
      MatFormFieldModule,NgSelectComponent,FormsModule,MatOptionModule,MatSelectModule,NgxMatSelectSearchModule],
  templateUrl: './edit-property-compare.component.html',
  styleUrl: './edit-property-compare.component.css',
})
export class EditPropertyCompareComponent {
  propertyForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditPropertyCompareComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      application ?: string; configId?:string; env?:string; fieldGroup?: string,target?:string[],type?:string[],id?:string;
      isEdit?:string;label?:string;profile?:string;propKey?:string;propertyType?:string;secret?:string;tenant?:string;tenantEnvId?:string;value?:string;applications?:string[];fieldGroups:string[];
    }
  ) {
    console.log(data);
    
    this.propertyForm = this.fb.group({
      // environment: [{ value: data.environment, disabled: true }, Validators.required],
      // tenant: [{ value: data.tenant, disabled: true }, Validators.required],
      // propertyKey: [data.propertyKey, Validators.required],
      // propertyValue: [data.propertyValue, Validators.required],
      // id: [data.id, Validators.required],
      // fieldGroup: [data.fieldGroup, Validators.required],
      // target: [data.target, Validators.required],
      // type: [data.type, Validators.required],
      // application: [data.application, Validators.required],
      // release : [data.release,Validators.required]
      // 
      env: [{ value: data.env, disabled: true }, Validators.required],
      tenant: [{ value: data.tenant, disabled: true }, Validators.required],
      propKey: [{value: data.propKey,disabled:true}, Validators.required],
      value: [data.value, Validators.required],
      application:[data.application,Validators.required],
      fieldGroup:[data.fieldGroup,Validators.required],
      propertyType:[data.propertyType,Validators.required],
      label:[data.label,Validators.required],
    });
  }

    selectedApplication: string | null = null;
    searchInput = new FormControl('');
  
  

  onSave() {
    if (this.propertyForm.valid) {
      this.dialogRef.close(this.propertyForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
