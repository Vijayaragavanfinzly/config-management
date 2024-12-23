import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { CompareService } from '../../services/compare-service/compare.service';
import { MatDialog } from '@angular/material/dialog';
import { PropertyService } from '../../services/property-service/property.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmCopyPropertyDialogComponent } from '../miscellaneous/dialogs/confirm-copy-property-dialog/confirm-copy-property-dialog.component';
import { UpdateComparePropertyDialogComponent } from '../miscellaneous/dialogs/update-compare-property-dialog/update-compare-property-dialog.component';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-compare-by-tenant',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MatTabsModule, NgSelectComponent, MatTooltipModule],
  templateUrl: './compare-by-tenant.component.html',
  styleUrl: './compare-by-tenant.component.css'
})
export class CompareByTenantComponent {
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
  // comparisonData: any[] = [];
  // filteredSameData: any[] = [];
  // filteredDifferentData: any[] = [];
  // filteredDistinctData: any[] = [];
  hoveredRow: any = null;

  tenantBasedSized: number = 0;
  nonTenantBasedSize: number = 0;
  tenantPropertySameSize: number = 0;
  tenantPropertyDifferentSize: number = 0;
  nonTenantPropertySameSize: number = 0;
  nonTenantPropertyDifferentSize: number = 0;

  filteredTenantBasedProperties: any[] = [];
  filteredRemainingProperties: any[] = [];

  filteredTenantBasedPropertiesSameData: any[] = [];
  filteredTenantBasedPropertiesDifferentData: any[] = [];

  filteredRemainingPropertiesSameData: any[] = [];
  filteredRemainingPropertiesDifferentData: any[] = [];



  activeTab: string = 'tenant';
  showFilter: boolean = false;
  searchQuery: string = '';
  showSearchBar: boolean = false;

  showFilterDropdown: boolean = false;

  filters = {
    matching: true,
    nonMatching: true,
  };

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  toggleFilterDropdown(): void {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  filterMatchingProperties(): void {
    console.log('Filtering Matching Properties');
    this.showFilterDropdown = false; 
  }

  // Filter Non-Matching Properties
  filterNonMatchingProperties(): void {
    console.log('Filtering Non-Matching Properties');
    this.showFilterDropdown = false;
  }

  commonPropertiesColumns = [
    { name: 'Property Key', field: 'propertyKey', width: 150 },
    { name: 'Property Value', field: 'PropertyValue1', width: 150 },
  ];

  commonPropertiesColumns_different = [
    { name: 'Property Key', field: 'propertyKey', width: 150 },
    { name: 'Property Value 1', field: 'PropertyValue1', width: 150 },
    { name: 'Property Value 2', field: 'PropertyValue2', width: 150 }
  ]

  tenantPropertiesColumn_same = [
    { name: 'Master Key', field: 'masterKey', width: 150 },
    // { name: 'Property Key 1', field: 'propertyKey1', width: 150 },
    // { name: 'Property Key 2', field: 'propertyKey2', width: 150 },
    { name: 'Property Value', field: 'propertyValue1', width: 150 },
  ]

  differentColumns = [
    { name: 'Master Key', field: 'masterKey', width: 300 },
    { name: 'Property Key 1', field: 'propertyKey', width: 300 },
    { name: 'Tenant 1 Value', field: 'PropertyValue1', width: 250 },
    { name: 'Actions T1', field: 'actionsT1', width: 100 },
    { name: 'Property Key 2', field: 'propertyKey', width: 300 },
    { name: 'Tenant 2 Value', field: 'PropertyValue2', width: 250 },
    { name: 'Actions T2', field: 'actionsT2', width: 100 },
  ];

  columnConfigurations: { [key: string]: any[] } = {
    common: this.commonPropertiesColumns,
    common_different: this.commonPropertiesColumns_different,
    tenant_same: this.tenantPropertiesColumn_same,
    different: this.differentColumns
  };

  private startX: number = 0;
  private startWidth: number = 0;
  private currentColumnIndex: number = 0;
  private tableType: string = '';
  private removeListeners: Function[] = [];

  

  private readonly MIN_COLUMN_WIDTH = 100;

  showDropdown: boolean = false;
  selectedFilter: string = 'Matching';

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  // selectFilter(option: string) {
  //   if (option === 'matching') {
  //     this.filters.matching = true;
  //     this.filters.nonMatching = false;
  //   } else if (option === 'nonMatching') {
  //     this.filters.nonMatching = true;
  //     this.filters.matching = false;
  //   }
  //   this.showDropdown = false;
  // }

  selectFilter(option: string) {
    this.selectedFilter = option;
    this.showDropdown = false;
  }


  constructor(private tenantService: TenantService, private compareService: CompareService, private dialog: MatDialog, private propertyService: PropertyService, private snackBar: MatSnackBar, private renderer: Renderer2) { }

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
    if (this.selectedTenant1 && this.selectedTenant2 && this.selectedEnv1 && this.selectedEnv2) {
      console.log('Comparing environments:', this.selectedEnv1, this.selectedEnv2);
      if (this.selectedTenant1 === this.selectedTenant2) {
        this.snackBar.open('Both Tenants cannot be same', 'Close', {
          duration: 3000,
          panelClass: ['custom-toast', 'toast-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        return;
      }
      this.compareService.compareTenants(this.selectedTenant1, this.selectedEnv1.toLowerCase(), this.selectedTenant2, this.selectedEnv2.toLowerCase()).subscribe({
        next: (data) => {
          if (data.statusCode === 200) {
            console.log('Comparison result:', data);
            this.filteredTenantBasedProperties = data.data.tenantBasedProperties;
            this.tenantBasedSized = this.filteredTenantBasedProperties.length;
            this.filteredRemainingProperties = data.data.commonProperties;
            this.nonTenantBasedSize = this.filteredRemainingProperties.length;
            this.filteredTenantBasedPropertiesSameData = this.filteredTenantBasedProperties.filter(entry => entry.isSame === true);
            this.filteredTenantBasedPropertiesDifferentData = this.filteredTenantBasedProperties.filter(entry => entry.isSame === false);
            this.filteredRemainingPropertiesSameData = this.filteredRemainingProperties.filter(entry => entry.isSame === true);
            this.filteredRemainingPropertiesDifferentData = this.filteredRemainingProperties.filter(entry => entry.isSame === false);
            this.tenantPropertySameSize = this.filteredTenantBasedPropertiesSameData.length;
            this.tenantPropertyDifferentSize = this.filteredTenantBasedPropertiesDifferentData.length;
            this.nonTenantPropertySameSize = this.filteredRemainingPropertiesSameData.length;
            this.nonTenantPropertyDifferentSize = this.filteredRemainingPropertiesDifferentData.length;
            console.log(this.filteredRemainingProperties);
          }
          else {
            console.log(data);
            console.log(data.message);
            this.snackBar.open(data.message, 'Close', {
              duration: 3000,
              panelClass: ['custom-toast', 'toast-error'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }


        },
        error: (err) => console.error('Error comparing environments:', err),
      });
    } else {
      this.snackBar.open('Please select an environment for both tenants.', 'Close', {
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
    this.filteredRemainingProperties = [];
    this.filteredRemainingPropertiesDifferentData = [];
    this.filteredRemainingPropertiesSameData = [];
    this.filteredTenantBasedProperties = [];
    this.filteredTenantBasedPropertiesDifferentData = [];
    this.filteredTenantBasedPropertiesSameData = [];
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
      width: '600px',
      data: { message: `Are you sure you want to copy data to ${targetTenant} - ${targetEnvironment}?` }
    });

    dialogRef.afterClosed().subscribe(result => {

      const payload = {
        tenant: targetTenant,
        environment : targetEnvironment,
        propertyKey,
        propertyValue
      }
      if (result) {
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

    const tenant = propertyValue === 'value1' ? this.selectedTenant1 : this.selectedTenant2;
    const environment = propertyValue === 'value1' ? this.selectedEnv1 : this.selectedEnv2;

    const dialogRef = this.dialog.open(UpdateComparePropertyDialogComponent, {
      width: '600px',
      data: {
        propertyKey: propertyValue === 'value1' ? entry.propertyKey1 : entry.propertyKey2,
        propertyValue: property,
        tenant: propertyValue === 'value1' ? this.selectedTenant1 : this.selectedTenant2,
        environment: propertyValue === 'value1' ? this.selectedEnv1 : this.selectedEnv2,
      },
    });

    dialogRef.afterClosed().subscribe((updatedData) => {
      if (updatedData) {
        console.log("hi");
        
        console.log(updatedData);
        entry[propertyValue] = updatedData.propertyValue;
        console.log('Updated entry:', entry);
        const payload = {
          tenant,
          environment,
          propertyKey: propertyValue === 'value1' ? entry.propertyKey1 : entry.propertyKey2,
          propertyValue: updatedData.propertyValue,
        };
        console.log("Edit is in progress");
        
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
      this.snackBar.open('Property Value successfully Copied to clipoard!', 'Close', {
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
      this.filteredRemainingPropertiesSameData = this.filteredRemainingProperties.filter(entry => entry.isSame === true);
      this.filteredRemainingPropertiesDifferentData = this.filteredRemainingProperties.filter(entry => entry.isSame === false);
      this.filteredTenantBasedPropertiesSameData = this.filteredTenantBasedProperties.filter(entry => entry.isSame === true);
      this.filteredTenantBasedPropertiesDifferentData = this.filteredTenantBasedProperties.filter(entry => entry.isSame === false);
      return;
    }

    this.filteredRemainingPropertiesSameData = this.filteredRemainingProperties.filter(
      entry => entry.isSame === true && this.matchQuery(entry, query)
    );

    this.filteredRemainingPropertiesDifferentData = this.filteredRemainingProperties.filter(
      entry => entry.isSame === false && this.matchQuery(entry, query)
    );

    this.filteredTenantBasedPropertiesSameData = this.filteredTenantBasedProperties.filter(
      entry => entry.isSame === true && this.matchTenantQuery(entry, query)
    );

    this.filteredTenantBasedPropertiesDifferentData = this.filteredTenantBasedProperties.filter(
      entry => entry.isSame === false && this.matchTenantQuery(entry, query)
    );
  }

  private matchQuery(entry: any, query: string): boolean {
    return (
      (entry.propertyKey && entry.propertyKey.toLowerCase().includes(query)) ||
      (entry.PropertyValue1 && entry.PropertyValue1.toLowerCase().includes(query)) ||
      (entry.PropertyValue2 && entry.PropertyValue2.toLowerCase().includes(query))
    );
  }

  private matchTenantQuery(entry: any, query: string): boolean {
    return (
      (entry.masterKey && entry.masterKey.toLowerCase().includes(query)) ||
      (entry.propertyKey1 && entry.propertyKey1.toLowerCase().includes(query)) ||
      (entry.propertyKey2 && entry.propertyKey2.toLowerCase().includes(query)) ||
      (entry.value1 && entry.value1.toLowerCase().includes(query)) ||
      (entry.value2 && entry.value2.toLowerCase().includes(query))
    )
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
    const columns = this.columnConfigurations[this.tableType];
    this.startWidth = columns[columnIndex].width;

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

    const columns = this.columnConfigurations[this.tableType];
    columns[this.currentColumnIndex].width = newWidth;
  }

  onMouseUp(moveListener: Function, upListener: Function) {
    moveListener();
    upListener();
    this.removeListeners = [];

    this.tableType = '';
    this.currentColumnIndex = -1;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
