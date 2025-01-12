import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-compare-config-db',
  standalone: true,
  imports: [
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatSelect
  ],
  templateUrl: './comparison-dialog.component.html',
  styleUrl: './comparison-dialog.component.css'
})

export class ComparisonDialogComponent {
  entry: any;
  tenantsInEnv1: string[] = [];
  filteredTenantsEnv1: string[] = [];
  selectedTenantEnv1: string = '';
  searchInputEnv1: FormControl = new FormControl();
  tenantsInEnv2: string[] = [];
  filteredTenantsEnv2: string[] = [];
  selectedTenantEnv2: string = '';
  searchInputEnv2: FormControl = new FormControl();


  constructor(
    public dialogRef: MatDialogRef<ComparisonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.entry = data.entry;
    this.tenantsInEnv1 = data.tenantsInEnv1 || [];
    this.tenantsInEnv2 = data.tenantsInEnv2 || [];
    this.filteredTenantsEnv1 = [...this.tenantsInEnv1];
    this.filteredTenantsEnv2 = [...this.tenantsInEnv2];

    this.setupSearchFiltering();
  }

  tenantDataEnv1: string | null = null;
  tenantDataEnv2: string | null = null;

populateTenantData(environment: 'env1' | 'env2') {
  console.log(this.selectedTenantEnv1);
  console.log(this.selectedTenantEnv2);
  
  
  // if (environment === 'env1') {
  //   this.tenantDataEnv1 = this.selectedTenantEnv1
  //     ? `Data for ${this.selectedTenantEnv1}`
  //     : null;
  // } else if (environment === 'env2') {
  //   this.tenantDataEnv2 = this.selectedTenantEnv2
  //     ? `Data for ${this.selectedTenantEnv2}`
  //     : null;
  // }
}


  setupSearchFiltering() {
    this.searchInputEnv1.valueChanges.pipe(debounceTime(300)).subscribe((query: string) => {
      this.filteredTenantsEnv1 = this.filterTenants(query, this.tenantsInEnv1);
    });
    this.searchInputEnv2.valueChanges.pipe(debounceTime(300)).subscribe((query: string) => {
      this.filteredTenantsEnv2 = this.filterTenants(query, this.tenantsInEnv2);
    });
  }

  filterTenants(query: string, tenants: string[]): string[] {
    if (!query) {
      return tenants;
    }
    const lowerCaseQuery = query.toLowerCase();
    return tenants.filter(tenant => tenant.toLowerCase().includes(lowerCaseQuery));
  }

  save() {
    const dataToSave = {
      tenantEnv1: this.selectedTenantEnv1,
      tenantEnv2: this.selectedTenantEnv2
    };
    this.dialogRef.close(dataToSave);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
