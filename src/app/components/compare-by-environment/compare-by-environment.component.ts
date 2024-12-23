import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { UpdateComparePropertyDialogComponent } from '../miscellaneous/dialogs/update-compare-property-dialog/update-compare-property-dialog.component';
import { ConfirmCopyPropertyDialogComponent } from '../miscellaneous/dialogs/confirm-copy-property-dialog/confirm-copy-property-dialog.component';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { CompareService } from '../../services/compare-service/compare.service';
import { MatDialog } from '@angular/material/dialog';
import { PropertyService } from '../../services/property-service/property.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-compare-by-environment',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterModule,MatTabsModule,NgSelectComponent],
  templateUrl: './compare-by-environment.component.html',
  styleUrl: './compare-by-environment.component.css'
})
export class CompareByEnvironmentComponent implements OnInit{
  tenants: any[] = [];
  tenantNames: string[] = [];
  selectedTenant1: string = '';
  selectedTenant2: string = '';
  tenant1Environments: string[] = [];
  tenant2Environments: string[] = [];
  selectedEnv1: string = '';
  selectedEnv2: string = '';
  allEnvironments: string[] = [];
  loading: boolean = false;
  comparisonData: any[] = [];
  filteredSameData: any[] = [];
  filteredDifferentData: any[] = [];
  hoveredRow: any = null;
  matchingPropertySize : number = 0;
  nonMatchingPropertySize : number = 0;
  filteredDistinctData: any[] = [];
  distinctPropertySize : number = 0;

  activeTab: number = 0;
  searchQuery: string = '';
  showSearchBar: boolean = false;

  matchingColumns = [
    { name: 'Property Key', field: 'propertyKey', width: 150 },
    { name: 'Property Value', field: 'PropertyValue1', width: 150 },
  ];

  differentColumns = [
    { name: 'Property Key', field: 'propertyKey', width: 300 },
    { name: 'Tenant 1 Value', field: 'PropertyValue1', width: 250 },
    { name: 'Actions', field: 'actionsT1', width: 100 },
    { name: 'Tenant 2 Value', field: 'PropertyValue2', width: 250 },
    { name: 'Actions', field: 'actionsT2', width: 100 },
  ];

  private startX: number = 0;
  private startWidth: number = 0;
  private currentColumnIndex: number = 0;
  private tableType: string = '';
  private removeListeners: Function[] = [];

  private readonly MIN_COLUMN_WIDTH = 100;


  constructor(private tenantService: TenantService, private compareService: CompareService, private dialog: MatDialog, private propertyService: PropertyService, private snackBar: MatSnackBar,private renderer: Renderer2) { }

  ngOnInit(): void {
    this.loadAllTenants();
  }

  loadAllTenants(): void {
    this.tenantService.getAllTenants().subscribe({
      next: (data) => {
        this.tenants = data.data;
        console.log(this.tenants);
        this.tenantNames = this.tenants.map((tenant) => tenant.tenant.toUpperCase()); 
      },
      error: (err) => console.error('Error fetching tenants:', err),
    });
  }

  loadEnvironmentsForTenant(tenantKey: string): void {
    this.loading = true;
    const selectedTenant = tenantKey === 'tenant1' ? this.selectedTenant1.toLowerCase() : this.selectedTenant2.toLowerCase();

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

  compareEnvironments(): void {
    if (this.selectedTenant1 && this.selectedEnv1 && this.selectedEnv2) {
      console.log('Comparing environments:', this.selectedEnv1, this.selectedEnv2);
      if(this.selectedEnv1 === this.selectedEnv2){
        this.snackBar.open('Both Environments cannot be same', 'Close', {
          duration: 3000,
          panelClass: ['custom-toast', 'toast-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        return;
      }
      this.compareService.compareTenants(this.selectedTenant1, this.selectedEnv1.toLowerCase(), this.selectedTenant1, this.selectedEnv2.toLowerCase()).subscribe({
        next: (data) => {
          console.log('Comparison result:', data);
          this.comparisonData = data.data.result2;
          this.filteredSameData = this.comparisonData.filter(entry => entry.isSame === true);
          this.filteredDistinctData = data.data.result1;
          this.distinctPropertySize = this.filteredDistinctData.length;
          this.matchingPropertySize = this.filteredSameData.length;
          this.filteredDifferentData = this.comparisonData.filter(entry => entry.isSame === false);
          this.nonMatchingPropertySize = this.filteredDifferentData.length;
          console.log(this.matchingPropertySize + " " + this.nonMatchingPropertySize);
        },
        error: (err) => console.error('Error comparing environments:', err),
      });
    } else {
      this.snackBar.open('Please fill all the required fields.', 'Close', {
        duration: 3000,
        panelClass: ['custom-toast', 'toast-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }

  clearSelections(): void {
    this.selectedTenant1 = '';
    this.selectedTenant2 = '';
    this.selectedEnv1 = '';
    this.selectedEnv2 = '';
    this.tenant1Environments = [];
    this.tenant2Environments = [];
    this.comparisonData = [];
    this.filteredSameData = [];
    this.filteredDifferentData = []
    this.searchQuery = ''
    this.snackBar.open('Comparison cleared successfully!', 'Close', {
      duration: 3000,
      panelClass: ['custom-toast', 'toast-success'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  openConfirmationDialog(targetTenant: string, targetEnvironment: string, propertyValue: string, propertyKey: string) {
    console.log(targetTenant);
    if (propertyValue === null) {
      this.snackBar.open("Can't assign a empty value", 'Close', {
        duration: 3000,
        panelClass: ['custom-toast', 'toast-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    const dialogRef = this.dialog.open(ConfirmCopyPropertyDialogComponent, {
      width: '350px',
      data: { message: `Are you sure you want to copy data to ${targetTenant} - ${targetEnvironment}?` }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {
        const payload = {
          targetTenant,
          targetEnvironment,
          propertyKey,
          propertyValue
        }
        this.compareService.editProperty(payload).subscribe({
          next: (response) => {
            console.log(response);

            console.log('Database updated successfully');
            this.compareEnvironments();
            this.snackBar.open('Configuration updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['custom-toast', 'toast-success'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          },
          error: (err) => {
            console.error('Error updating database:', err)
            this.snackBar.open('Update Failed! Try Again!', 'Close', {
              duration: 3000,
              panelClass: ['custom-toast', 'toast-error'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        });
      }
    });
  }


  editProperty(entry: any, propertyValue: string) {
    console.log(entry);
    const property = entry[propertyValue];

    const tenant = propertyValue === 'PropertyValue1' ? this.selectedTenant1 : this.selectedTenant2;
    const environment = propertyValue === 'PropertyValue1' ? this.selectedEnv1 : this.selectedEnv2;

    const dialogRef = this.dialog.open(UpdateComparePropertyDialogComponent, {
      width: '400px',
      data: {
        propertyKey: entry.propertyKey,
        propertyValue: property,
        tenant: propertyValue === 'propertyValue1' ? this.selectedTenant1 : this.selectedTenant2,
        environment: propertyValue === 'propertyValue1' ? this.selectedEnv1 : this.selectedEnv2,
      },
    });

    dialogRef.afterClosed().subscribe((updatedData) => {
      if (updatedData) {
        console.log(updatedData);
        entry[propertyValue] = updatedData.propertyValue;
        console.log('Updated entry:', entry);
        const key = entry.propertyKey;
        const value = updatedData.propertyValue
        const payload = {
          tenant, 
          environment, 
          key,
          value
        }
        this.compareService.editProperty(payload).subscribe({
          next: (response) => {
            console.log(response);

            console.log('Database updated successfully');
            this.compareEnvironments();
            this.snackBar.open('Configuration updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['custom-toast', 'toast-success'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          },
          error: (err) => {
            console.error('Error updating database:', err)
            this.snackBar.open('Update Failed! Try Again!', 'Close', {
              duration: 3000,
              panelClass: ['custom-toast', 'toast-error'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        });
      }
    });

  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Property Value copied to clipoard!', 'Close', {
        duration: 3000,
        panelClass: ['custom-toast', 'toast-success'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }).catch(err => {
      console.error('Unable to copy text: ', err);
    });
  }


  filterResults(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.filteredSameData = this.comparisonData.filter(entry => entry.isSame === true);
      this.filteredDifferentData = this.comparisonData.filter(entry => entry.isSame === false);
      return;
    }

    this.filteredSameData = this.comparisonData.filter(
      entry => entry.isSame === true && this.matchQuery(entry, query)
    );

    this.filteredDifferentData = this.comparisonData.filter(
      entry => entry.isSame === false && this.matchQuery(entry, query)
    );
  }

  private matchQuery(entry: any, query: string): boolean {
    return (
      (entry.propertyKey && entry.propertyKey.toLowerCase().includes(query)) ||
      (entry.PropertyValue1 && entry.PropertyValue1.toLowerCase().includes(query)) ||
      (entry.PropertyValue2 && entry.PropertyValue2.toLowerCase().includes(query))
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.filterResults();
  }


  onMouseDown(event: MouseEvent, columnIndex: number, tableType: string) {
    event.preventDefault();

    this.tableType = tableType;
    this.currentColumnIndex = columnIndex;
    this.startX = event.clientX;
    this.startWidth =
      this.tableType === 'matching'
        ? this.matchingColumns[columnIndex].width
        : this.differentColumns[columnIndex].width;

    this.removeListeners.forEach((remove) => remove());
    this.removeListeners = [];

    const moveListener = this.renderer.listen(
      'document',
      'mousemove',
      (moveEvent: MouseEvent) => this.onMouseMove(moveEvent)
    );
    const upListener = this.renderer.listen('document', 'mouseup', () =>
      this.onMouseUp(moveListener, upListener)
    );

    this.removeListeners.push(moveListener, upListener);
  }

  onMouseMove(event: MouseEvent) {
    const deltaX = event.clientX - this.startX;
    const newWidth = Math.max(this.startWidth + deltaX, this.MIN_COLUMN_WIDTH);

    if (this.tableType === 'matching') {
      this.matchingColumns[this.currentColumnIndex].width = newWidth;
    } else {
      this.differentColumns[this.currentColumnIndex].width = newWidth;
    }
  }

  onMouseUp(moveListener: Function, upListener: Function) {
    moveListener();
    upListener();
    this.removeListeners = [];

    this.tableType = '';
    this.currentColumnIndex = -1;
  }
}
