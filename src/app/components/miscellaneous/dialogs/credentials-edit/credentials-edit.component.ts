import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-credentials-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatDialogModule,
        MatFormFieldModule,NgSelectComponent,FormsModule,MatOptionModule,MatSelectModule,NgxMatSelectSearchModule,MatIconModule],
  templateUrl: './credentials-edit.component.html',
  styleUrl: './credentials-edit.component.css'
})
export class CredentialsEditComponent implements OnInit{
  propertyForm: FormGroup;
  
    passwordVisible: boolean = false;
  
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    }
  
    
  
      constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CredentialsEditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { environment?:string;username?:string;password?:string;url?:string;
         }
      ) {
        console.log(data);
        console.log(data.environment, data.username, data.password, data.url);

        this.propertyForm = this.fb.group({
          environment: [{ value: data.environment}, Validators.required],
          username:[{value:data.username},Validators.required],
          password:[{value:data.password},Validators.required],
          url:[{value:data.url},Validators.required]
        });
      }
    
      searchInput = new FormControl('');
    
    
    
      ngOnInit(): void {
  
      }
    
    
      onSave(): void {
        this.dialogRef.close(this.propertyForm.value);
      }
    
      onCancel(): void {
        this.dialogRef.close();
      }
}
