import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { CloneService } from '../../services/clone-service/clone.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PropertyService } from '../../services/property-service/property.service';
import { ExportService } from '../../services/export-service/export.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ErrorSnackbarComponent } from '../miscellaneous/snackbar/error-snackbar/error-snackbar.component';
import { SuccessSnackbarComponent } from '../miscellaneous/snackbar/success-snackbar/success-snackbar.component';

@Component({
  selector: 'app-clone',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ReactiveFormsModule, MatTabsModule, MatFormFieldModule, MatSelectModule, NgxMatSelectSearchModule,
    MatInputModule, MatOptionModule, MatButtonModule, MatDialogModule
  ],
  templateUrl: './clone.component.html',
  styleUrl: './clone.component.css'
})
export class CloneComponent {
  tenants: any[] = [];
  tenant1Environments: string[] = [];
  tenant2Environments: string[] = [];
  searchQuery: string = '';
  loading: boolean = false;

  manualTenant: string | undefined = '';
  manualEnv: string | undefined = '';
  selectedTenant: string | undefined = '';
  selectedEnv: string | undefined = '';

  searchInput = new FormControl('');

  clonedProperties: any[] = [];
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

  constructor(private tenantService: TenantService, private cloneService: CloneService, private snackBar: MatSnackBar, private renderer: Renderer2, private propertService: PropertyService, private exportService: ExportService) {
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
    const selectedTenant = tenantKey === 'tenant1' ? this.manualTenant?.toLowerCase() : this.selectedTenant?.toLowerCase();

    this.tenantService.getTenantEnvironments(selectedTenant || '').subscribe({
      next: (data) => {
        const environments = data.data;
        const filteredEnvironments = environments;

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
      this.snackBar.openFromComponent(ErrorSnackbarComponent, {
        data: {
          message: `Please fill all the fields !`,
          icon: 'check-circle'
        },
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    // Ensure tenant & environment combination is unique
    if (this.tenants.some(t => t === (this.manualTenant ?? '') && this.tenant2Environments.includes(this.manualEnv ?? ''))) {
      this.snackBar.openFromComponent(ErrorSnackbarComponent, {
        data: {
          message: `Tenant & Environment Already Exist !`,
          icon: 'check-circle'
        },
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    this.loading = true;

    // Clone tenants
    this.cloneService.cloneTenants(this.manualTenant.toLowerCase(), this.manualEnv.toLowerCase(), this.selectedTenant.toLowerCase(), this.selectedEnv.toLowerCase()).subscribe({
      next: (data) => {
        console.log(data);
        console.log(data.statusCode);

        if (data.statusCode == 200) {
          this.snackBar.openFromComponent(SuccessSnackbarComponent, {
            data: {
              message: `Cloned Successfully !`,
              icon: 'check-circle'
            },
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          console.log("cloning");
          this.manualTenant = '';
          this.manualEnv = '';
          this.selectedTenant = '';
          this.selectedEnv = '';
          this.tenant1Environments = [];
          this.tenant2Environments = [];
          this.searchQuery = ''
          // this.clearSelections();
          // this.exportService.exportInsertQueryForNewTenant(this.manualTenant.toLowerCase(),this.manualEnv.toLowerCase()).subscribe({
          //   next: (blob) => {
          //     console.log(blob);

          //     const url = window.URL.createObjectURL(blob);
          //     const a = document.createElement('a');
          //     a.href = url;
          //     a.download = `insert_properties.sql`;
          //     a.click();
          //     window.URL.revokeObjectURL(url);
          //     this.snackBar.open('Exported Successfully!', 'Close', {
          //       duration: 3000,
          //       panelClass: ['custom-toast', 'toast-success'],
          //       horizontalPosition: 'center',
          //       verticalPosition: 'top',
          //     });
          //   },
          //   error: (err) => {
          //     console.error("Error exporting properties:", err);
          //     this.snackBar.open('Export failed.', 'Close', {
          //       duration: 3000,
          //       panelClass: ['custom-toast', 'toast-error'],
          //       horizontalPosition: 'center',
          //       verticalPosition: 'top',
          //     });
          //   },
          //   complete: () => {
          //   },
          // })
        } else {
          this.snackBar.openFromComponent(ErrorSnackbarComponent, {
            data: {
              message: `Unexpected response from server !`,
              icon: 'check-circle'
            },
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error during cloning:', err);
        this.snackBar.openFromComponent(ErrorSnackbarComponent, {
          data: {
            message: `Cloning failed. Please try again !`,
            icon: 'check-circle'
          },
          duration: 3000,
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
    this.searchQuery = '';


    setTimeout(() => { }, 0);


    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
      data: {
        message: `Cleared Successfully !`,
        icon: 'check-circle'
      },
      duration: 3000,
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
