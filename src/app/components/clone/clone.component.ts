import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { CloneService } from '../../services/clone-service/clone.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PropertyService } from '../../services/property-service/property.service';

@Component({
  selector: 'app-clone',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './clone.component.html',
  styleUrl: './clone.component.css'
})
export class CloneComponent {
  tenants: any[] = [];
  selectedTenant: string = '';
  tenant1Environments: string[] = [];
  tenant2Environments: string[] = [];
  selectedEnv: string = '';
  searchQuery: string = '';
  loading:boolean = false;

  manualTenant: string = '';
  manualEnv: string = '';

  clonedProperties :any[] = [];
  columns: { name: string; width: number }[] = [
    { name: 'Property Key', width: 200 },
    { name: 'Property Value', width: 300 }
  ];

  private startX: number = 0;
  private startWidth: number = 0;
  private currentColumnIndex: number = 0;
  private tableType: string = '';
  private removeListeners: Function[] = [];
  private readonly MIN_COLUMN_WIDTH = 100;


  constructor(private tenantService:TenantService,private cloneService:CloneService,private snackBar: MatSnackBar,private renderer:Renderer2,private propertService:PropertyService){

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
    const selectedTenant = tenantKey === 'tenant1' ? this.manualTenant.toLowerCase() : this.selectedTenant.toLowerCase();

    this.tenantService.getTenantEnvironments(selectedTenant).subscribe({
      next: (data) => {
        const environments = data.data.environments;
        const filteredEnvironments = environments
        .filter((env: string) => env.toUpperCase() !== 'PENDING')
        .map((env: string) => env.toUpperCase());

        if (tenantKey === 'tenant1') {
          this.tenant1Environments = filteredEnvironments;
        } else {
          this.tenant2Environments = filteredEnvironments;
        }
        this.loading = false;
      },
      error: (err) => console.error(`Error fetching environments for ${tenantKey}:`, err),
    });
  }

  cloneProperties(): void {
    console.log(this.tenants);
    console.log(this.tenant2Environments);
  
    if (!this.manualTenant || !this.manualEnv || !this.selectedTenant || !this.selectedEnv) {
      this.snackBar.open('Please fill all the fields', 'Close', {
        duration: 3000,
        panelClass: ['custom-toast', 'toast-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
  
    // Ensure tenant & environment combination is unique
    if (this.tenants.some(t => t.tenant === this.manualTenant && this.tenant2Environments.includes(this.manualEnv))) {
      this.snackBar.open('Tenant & Environment Already Exist!', 'Close', {
        duration: 3000,
        panelClass: ['custom-toast', 'toast-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
  
    this.loading = true;
  
    // Clone tenants
    this.cloneService.cloneTenants(this.manualTenant.toLowerCase(), this.manualEnv.toLowerCase(), this.selectedTenant, this.selectedEnv).subscribe({
      next: (data) => {
        console.log(data);
        console.log(data.statusCode);
        
        if (data.statusCode === 200) {
          this.snackBar.open('Cloned Successfully!', 'Close', {
            duration: 3000,
            panelClass: ['custom-toast', 'toast-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          console.log("cloning");
          
          this.propertService.getTenantProperties(this.manualTenant, this.manualEnv).subscribe({
            next: (data: any) => {
              this.clonedProperties = data.data;
              console.log(this.clonedProperties);
            },
            error: (err) => {
              console.error("Error fetching properties for tenant:", err);
            },
            complete: () => {
              this.loading = false; // Ensure loading is reset
            }
          });
        } else {
          this.snackBar.open('Unexpected response from server', 'Close', {
            duration: 3000,
            panelClass: ['custom-toast', 'toast-error'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error during cloning:', err);
        this.snackBar.open('Cloning failed. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['custom-toast', 'toast-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.loading = false; // Ensure loading is reset on error
      },
    });
  }
  

  clearSelections(): void {
    this.manualTenant = '';
    this.manualEnv = '';
    this.selectedTenant = '';
    this.selectedEnv = '';
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

  onMouseDown(event: MouseEvent, columnIndex: number): void {
    event.preventDefault();

    this.currentColumnIndex = columnIndex;
    this.startX = event.clientX;
    this.startWidth = this.columns[columnIndex].width;

    this.removeListeners.forEach((remove) => remove());
    this.removeListeners = [];

    const moveListener = this.renderer.listen('document', 'mousemove', (moveEvent) => this.onMouseMove(moveEvent));
    const upListener = this.renderer.listen('document', 'mouseup', () => this.onMouseUp());

    this.removeListeners.push(moveListener, upListener);
  }

  onMouseMove(event: MouseEvent): void {
    const delta = event.clientX - this.startX;
    const newWidth = Math.max(this.startWidth + delta, this.MIN_COLUMN_WIDTH);
    this.columns[this.currentColumnIndex].width = newWidth;
  }

  onMouseUp(): void {
    this.removeListeners.forEach((remove) => remove());
    this.removeListeners = [];
  }
}
