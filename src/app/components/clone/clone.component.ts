import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { CloneService } from '../../services/clone-service/clone.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-clone',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './clone.component.html',
  styleUrl: './clone.component.css'
})
export class CloneComponent {
  tenants: any[] = [];
  selectedTenant1: string = '';
  selectedTenant2: string = '';
  tenant1Environments: string[] = [];
  tenant2Environments: string[] = [];
  selectedEnv1: string = '';
  selectedEnv2: string = '';
  searchQuery: string = '';
  loading:boolean = false


  constructor(private tenantService:TenantService,private cloneService:CloneService,private snackBar: MatSnackBar){

  }


  ngOnInit(): void {
    this.loadAllTenants();
  }

  loadAllTenants(): void {
    this.tenantService.getAllTenants().subscribe({
      next: (data) => {
        this.tenants = data.data;
        console.log(this.tenants);

      },
      error: (err) => console.error('Error fetching tenants:', err),
    });
  }

  loadEnvironmentsForTenant(tenantKey: string): void {
    this.loading = true;
    const selectedTenant = tenantKey === 'tenant1' ? this.selectedTenant1 : this.selectedTenant2;

    this.tenantService.getTenantEnvironments(selectedTenant).subscribe({
      next: (data) => {
        const environments = data.data.environments;
        if (tenantKey === 'tenant1') {
          this.tenant1Environments = environments;
        } else {
          this.tenant2Environments = environments;
        }
        this.loading = false;
      },
      error: (err) => console.error(`Error fetching environments for ${tenantKey}:`, err),
    });
  }

  cloneProperties(): void {
    if (!this.selectedTenant1 || !this.selectedEnv1 || !this.selectedTenant2 || !this.selectedEnv2) {
      this.snackBar.open('Please select an environment for both tenants.', 'Close', {
        duration: 3000,
        panelClass: ['custom-toast', 'toast-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    this.loading = true;

    this.cloneService.cloneTenants(this.selectedTenant1,this.selectedEnv1,this.selectedTenant2,this.selectedEnv2).subscribe({
      next: (data) => {
        console.log(data);
        if(data.statusCode == "200"){
          this.snackBar.open('Cloned Successfully!', 'Close', {
            duration: 3000,
            panelClass: ['custom-toast', 'toast-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.loading = false;
          console.log("cloning successful!");
          
        }
        
        
      },
      error: (err) => {
        console.error('Error during cloning:', err);
        alert('Cloning failed. Please try again.');
        this.loading = false;
      },
    });
  }

  clearSelections(): void {
    this.selectedTenant1 = '';
    this.selectedTenant2 = '';
    this.selectedEnv1 = '';
    this.selectedEnv2 = '';
    this.tenant1Environments = [];
    this.tenant2Environments = [];
    this.searchQuery = ''
    this.snackBar.open('Cleared successfully!', 'Close', {
      duration: 3000,
      panelClass: ['custom-toast', 'toast-success'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
