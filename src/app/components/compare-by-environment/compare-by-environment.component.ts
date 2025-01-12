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
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-compare-by-environment',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterModule,MatTabsModule,NgSelectComponent,MatTooltipModule],
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
  
  paginatedTenantProperties: any[] = [];
  paginatedNonTenantProperties: any[] = [];
  paginatedTenantSameProperties: any[] = [];
  paginatedTenantDifferentProperties: any[] = [];
  paginatedNonTenantSameProperties: any[] = [];
  paginatedNonTenantDifferentProperties: any[] = [];



  propertySize:number = 0;

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  pages: number[] = []


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
    { name: 'Actions', field: 'actionsT1', width: 100 },
    { name: 'Property Value 2', field: 'PropertyValue2', width: 150 },
    { name: 'Actions', field: 'actionsT2', width: 100 },
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
    { name: 'Property Value 1', field: 'PropertyValue1', width: 250 },
    { name: 'Actions', field: 'actionsT1', width: 100 },
    { name: 'Property Key 2', field: 'propertyKey', width: 300 },
    { name: 'Property Value 2', field: 'PropertyValue2', width: 250 },
    { name: 'Actions', field: 'actionsT2', width: 100 },
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

  selectFilter(option: string) {
    this.selectedFilter = option;
    this.showDropdown = false;
    this.updatePagination();
    this.currentPage = 1;
  }



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
        this.selectedEnv1 = '';
        this.selectedEnv2 = '';
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
            this.currentPage = 1;
            this.updatePagination();
            console.log(this.filteredRemainingProperties);
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

  updatePagination() {
    if(this.activeTab === 'tenant' && this.selectedFilter === 'Matching'){
      this.totalPages = Math.ceil(this.filteredTenantBasedPropertiesSameData.length / this.pageSize);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      this.pages = this.getVisiblePages();
      this.paginatedTenantSameProperties = this.getPaginatedData();
    }
    else if(this.activeTab === 'tenant' && this.selectedFilter !== 'Matching'){
      this.totalPages = Math.ceil(this.filteredTenantBasedPropertiesDifferentData.length / this.pageSize);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      this.pages = this.getVisiblePages();
      this.paginatedTenantDifferentProperties = this.getPaginatedData();
    }
    else if(this.activeTab === 'common' && this.selectedFilter === 'Matching'){
      this.totalPages = Math.ceil(this.filteredRemainingPropertiesSameData.length / this.pageSize);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      this.pages = this.getVisiblePages();
      this.paginatedNonTenantSameProperties = this.getPaginatedData();
    }
    else if(this.activeTab === 'common' && this.selectedFilter !== 'Matching'){
      this.totalPages = Math.ceil(this.filteredRemainingPropertiesDifferentData.length / this.pageSize);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      this.pages = this.getVisiblePages();
      this.paginatedNonTenantDifferentProperties = this.getPaginatedData();
    }
    
  }

    getPaginatedData(): any {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      let length = 0;
      if(this.activeTab === 'tenant' && this.selectedFilter === 'Matching'){
        length = this.filteredTenantBasedPropertiesSameData.length;
      }
      else if(this.activeTab === 'tenant' && this.selectedFilter !== 'Matching'){
        length = this.filteredTenantBasedPropertiesDifferentData.length;
      }
      else if(this.activeTab === 'common' && this.selectedFilter === 'Matching'){
        length = this.filteredRemainingPropertiesSameData.length;
      }
      else if(this.activeTab === 'common' && this.selectedFilter !== 'Matching'){
        length = this.filteredRemainingPropertiesDifferentData.length;
      }
      const endIndex = Math.min(parseInt(startIndex.toString()) + parseInt(this.pageSize.toString()),length);
  
      console.log(`Start Index: ${startIndex}`);
      console.log(`End Index: ${endIndex}`);
      
      if(this.activeTab === 'tenant' && this.selectedFilter === 'Matching'){
        return this.filteredTenantBasedPropertiesSameData.slice(startIndex, endIndex);
      }
      else if(this.activeTab === 'tenant' && this.selectedFilter !== 'Matching'){
        return this.filteredTenantBasedPropertiesDifferentData.slice(startIndex, endIndex);
      }
      else if(this.activeTab === 'common' && this.selectedFilter === 'Matching'){
        return this.filteredRemainingPropertiesSameData.slice(startIndex, endIndex);
      }
      else if(this.activeTab === 'common' && this.selectedFilter !== 'Matching'){
        return this.filteredRemainingPropertiesDifferentData.slice(startIndex, endIndex);
      }
    }
  

  getVisiblePages(): number[] {
    const maxPagesToShow = 5;
    const visiblePages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    if (startPage > 1) {
      visiblePages.push(1);
      if (startPage > 2) visiblePages.push(-1);
    }

    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) visiblePages.push(-1);
      visiblePages.push(this.totalPages);
    }

    return visiblePages;
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
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

  editRemainingDifferentProperty(entry: any, propertyValue: string) {
    console.log(entry);
    const property = entry[propertyValue];

    const tenant = propertyValue === 'PropertyValue1' ? this.selectedTenant1 : this.selectedTenant2;
    const environment = propertyValue === 'PropertyValue1' ? this.selectedEnv1 : this.selectedEnv2;

    const dialogRef = this.dialog.open(UpdateComparePropertyDialogComponent, {
      width: '600px',
      data: {
        propertyKey: entry.propertyKey,
        propertyValue: property,
        tenant: propertyValue === 'PropertyValue1' ? this.selectedTenant1 : this.selectedTenant2,
        environment: propertyValue === 'PropertyValue1' ? this.selectedEnv1 : this.selectedEnv2,
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
          propertyKey: entry.propertyKey,
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

  getActiveTabCount(): number {
    if (this.activeTab === 'tenant') {
      return this.selectedFilter === 'Matching' ? this.tenantPropertySameSize : this.tenantPropertyDifferentSize;
    } else if (this.activeTab === 'common') {
      return this.selectedFilter === 'Matching' ? this.nonTenantPropertySameSize : this.nonTenantPropertyDifferentSize;
    }
    return 0;
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
    this.updatePagination();
    this.currentPage = 1;
  }
}
