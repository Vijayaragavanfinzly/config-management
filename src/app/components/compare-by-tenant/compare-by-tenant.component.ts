import { CommonModule } from '@angular/common';
import { Component, HostListener, Renderer2 } from '@angular/core';
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
import { DomSanitizer } from '@angular/platform-browser';
import { EditCompareComponent } from '../miscellaneous/dialogs/edit-compare/edit-compare.component';


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

  hoveredRow: any = null;

  tenantBasedSized: number = 0;
  nonTenantBasedSize: number = 0;
  tenantPropertySameSize: number = 0;
  tenantPropertyDifferentSize: number = 0;
  nonTenantPropertySameSize: number = 0;
  nonTenantPropertyDifferentSize: number = 0;

  properties: any[] = [];
  filteredProperties: any[] = [];
  matchingProperties: any[] = [];
  NonMatchingProperties: any[] = [];
  filteredMatchingProperties: any[] = [];
  filteredNonMatchingProperties: any[] = [];

  matchingPropertySize: number = 0;
  nonMatchingPropertySize: number = 0;

  filteredTenantBasedProperties: any[] = [];
  filteredRemainingProperties: any[] = [];

  filteredTenantBasedPropertiesSameData: any[] = [];
  filteredTenantBasedPropertiesDifferentData: any[] = [];

  filteredRemainingPropertiesSameData: any[] = [];
  filteredRemainingPropertiesDifferentData: any[] = [];

  totalMatchingProperties: number = 0;
  totalNonMatchingProperties: number = 0;

  paginatedTenantProperties: any[] = [];
  paginatedNonTenantProperties: any[] = [];
  paginatedTenantSameProperties: any[] = [];
  paginatedTenantDifferentProperties: any[] = [];
  paginatedNonTenantSameProperties: any[] = [];
  paginatedNonTenantDifferentProperties: any[] = [];

  paginatedMatchingProperties: any[] = [];
  paginatedNonMatchingProperties: any[] = [];

  showContextMenu = false;
  showContextMenuCopy = false;
  menuPosition = { x: 0, y: 0 };
  selectedEntry: any;
  selectedColumn: any;
  selectedColumn2: any;


  propertySize: number = 0;

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
    { name: 'Property Key', field: 'masterKey', width: 150 },
    // { name: 'Property Key 1', field: 'propertyKey1', width: 150 },
    // { name: 'Property Key 2', field: 'propertyKey2', width: 150 },
    { name: 'Property Value', field: 'propertyValue1', width: 150 },
  ]

  differentColumns = [
    { name: 'Property Key', field: 'masterKey', width: 300 },
    { name: 'Property Value 1', field: 'PropertyValue1', width: 250 },
    { name: 'Actions', field: 'actionsT1', width: 100 },
    { name: 'Property Value 2', field: 'PropertyValue2', width: 250 },
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


  constructor(private tenantService: TenantService, private compareService: CompareService, private dialog: MatDialog, private propertyService: PropertyService, private snackBar: MatSnackBar, private renderer: Renderer2, private sanitizer: DomSanitizer) { }

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
          this.selectedEnv1 = '';
        } else {
          this.tenant2Environments = filteredEnvironments;
          this.selectedEnv2 = '';
        }
        this.loading = false;
      },
      error: (err) => console.error(`Error fetching environments for ${tenantKey}:`, err),
    });
  }

  compareEnvironments(): void {
    if (this.selectedTenant1 && this.selectedTenant2 && this.selectedEnv1 && this.selectedEnv2) {
      console.log('Comparing environments:', this.selectedEnv1, this.selectedEnv2);
      if (this.selectedTenant1 === this.selectedTenant2 && this.selectedEnv1 === this.selectedEnv2) {
        this.snackBar.open('Both Inouts cannot be same', 'Close', {
          duration: 3000,
          panelClass: ['custom-toast', 'toast-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        return;
      }
      this.compareService.compareTenants(this.selectedTenant1.toLowerCase(), this.selectedEnv1.toLowerCase(), this.selectedTenant2.toLowerCase(), this.selectedEnv2.toLowerCase()).subscribe({
        next: (data) => {
          if (data.statusCode === 200) {
            console.log('Comparison result:', data);
            this.properties = data.data;
            this.matchingProperties = this.properties.filter(entry => entry.isSame === true);
            this.NonMatchingProperties = this.properties.filter(entry => entry.isSame === false);

            this.filteredMatchingProperties = [...this.matchingProperties];
            this.filteredNonMatchingProperties = [...this.NonMatchingProperties];
            this.matchingPropertySize = this.filteredMatchingProperties.length;
            this.nonMatchingPropertySize = this.filteredNonMatchingProperties.length;
            // this.filteredTenantBasedProperties = data.data.tenantBasedProperties;
            // this.tenantBasedSized = this.filteredTenantBasedProperties.length;
            // this.filteredRemainingProperties = data.data.commonProperties;
            // this.nonTenantBasedSize = this.filteredRemainingProperties.length;
            // this.filteredTenantBasedPropertiesSameData = this.filteredTenantBasedProperties.filter(entry => entry.isSame === true);
            // this.filteredTenantBasedPropertiesDifferentData = this.filteredTenantBasedProperties.filter(entry => entry.isSame === false);
            // this.filteredRemainingPropertiesSameData = this.filteredRemainingProperties.filter(entry => entry.isSame === true);
            // this.filteredRemainingPropertiesDifferentData = this.filteredRemainingProperties.filter(entry => entry.isSame === false);
            // this.tenantPropertySameSize = this.filteredTenantBasedPropertiesSameData.length;
            // this.tenantPropertyDifferentSize = this.filteredTenantBasedPropertiesDifferentData.length;
            // this.nonTenantPropertySameSize = this.filteredRemainingPropertiesSameData.length;
            // this.nonTenantPropertyDifferentSize = this.filteredRemainingPropertiesDifferentData.length;
            this.currentPage = 1;
            this.updatePagination();
            console.log(this.filteredMatchingProperties);
            console.log(this.filteredNonMatchingProperties);


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

  updatePagination() {
    if (this.activeTab === 'tenant' && this.selectedFilter === 'Matching') {
      this.totalPages = Math.ceil(this.filteredMatchingProperties.length / this.pageSize);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      this.pages = this.getVisiblePages();
      this.paginatedMatchingProperties = this.getPaginatedData();
    }
    else if (this.activeTab === 'tenant' && this.selectedFilter !== 'Matching') {
      this.totalPages = Math.ceil(this.filteredNonMatchingProperties.length / this.pageSize);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      this.pages = this.getVisiblePages();
      this.paginatedNonMatchingProperties = this.getPaginatedData();
    }
    // else if(this.activeTab === 'common' && this.selectedFilter === 'Matching'){
    //   this.totalPages = Math.ceil(this.filteredRemainingPropertiesSameData.length / this.pageSize);
    //   if (this.currentPage > this.totalPages) {
    //     this.currentPage = this.totalPages;
    //   }
    //   this.pages = this.getVisiblePages();
    //   this.paginatedNonTenantSameProperties = this.getPaginatedData();
    // }
    // else if(this.activeTab === 'common' && this.selectedFilter !== 'Matching'){
    //   this.totalPages = Math.ceil(this.filteredRemainingPropertiesDifferentData.length / this.pageSize);
    //   if (this.currentPage > this.totalPages) {
    //     this.currentPage = this.totalPages;
    //   }
    //   this.pages = this.getVisiblePages();
    //   this.paginatedNonTenantDifferentProperties = this.getPaginatedData();
    // }

  }

  getPaginatedData(): any {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    let length = 0;
    if (this.activeTab === 'tenant' && this.selectedFilter === 'Matching') {
      length = this.filteredMatchingProperties.length;
    }
    else if (this.activeTab === 'tenant' && this.selectedFilter !== 'Matching') {
      length = this.filteredNonMatchingProperties.length;
    }
    // else if(this.activeTab === 'common' && this.selectedFilter === 'Matching'){
    //   length = this.filteredRemainingPropertiesSameData.length;
    // }
    // else if(this.activeTab === 'common' && this.selectedFilter !== 'Matching'){
    //   length = this.filteredRemainingPropertiesDifferentData.length;
    // }
    const endIndex = Math.min(parseInt(startIndex.toString()) + parseInt(this.pageSize.toString()), length);

    console.log(`Start Index: ${startIndex}`);
    console.log(`End Index: ${endIndex}`);

    if (this.activeTab === 'tenant' && this.selectedFilter === 'Matching') {
      return this.filteredMatchingProperties.slice(startIndex, endIndex);
    }
    else if (this.activeTab === 'tenant' && this.selectedFilter !== 'Matching') {
      return this.filteredNonMatchingProperties.slice(startIndex, endIndex);
    }
    // else if(this.activeTab === 'common' && this.selectedFilter === 'Matching'){
    //   return this.filteredRemainingPropertiesSameData.slice(startIndex, endIndex);
    // }
    // else if(this.activeTab === 'common' && this.selectedFilter !== 'Matching'){
    //   return this.filteredRemainingPropertiesDifferentData.slice(startIndex, endIndex);
    // }
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
    this.filteredMatchingProperties = [];
    this.filteredNonMatchingProperties = [];
    this.searchQuery = ''
    this.snackBar.open('Comparison cleared successfully!', 'Close', {
      duration: 3000,
      panelClass: ['custom-toast', 'toast-success'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }





  openConfirmationDialog(propertyKey: string, targetEnvironment: string, newValue: string, oldValue: string) {
    console.log(propertyKey);
    if (newValue === null) {
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
      data: { message: `Are you sure you want to copy data to ${targetEnvironment}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      
      const payload = {
        tenantEnv: targetEnvironment,
        propertyKey: propertyKey,
        newValue: newValue,
        oldValue: oldValue
      }
      if (result) {
        console.log(payload);
        
        this.compareService.editInCompare(payload).subscribe({
          next: (response) => {
            if (response.statusCode === 201) {
              console.log(response);
              this.updatePagination();
              this.snackBar.open('Updated Successfully!', 'Close', {
                duration: 3000,
                panelClass: ['custom-toast', 'toast-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            }
          },
          error: (err) => {
            this.snackBar.open('Update Failed', 'Close', {
              duration: 3000,
              panelClass: ['custom-toast', 'toast-error'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            console.log(err);

          }
          
        })
      }
    });
  }

  editEntry(): void {
    console.log(this.selectedEntry);
    console.log(this.selectedColumn);
    

    const oldValue = this.selectedEntry[this.selectedColumn];
    const dialogData = {
      propertyKey: this.selectedEntry['propertyKey'],
      tenantEnv: this.selectedColumn2,
      value: this.selectedEntry[this.selectedColumn]
    }

    console.log(dialogData);


    const dialogRef = this.dialog.open(EditCompareComponent, {
      width: `700px`,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        const data = {
          tenantEnv: result.tenantEnv,
          propertyKey: result.propertykey,
          newValue: result.value,
          oldValue: oldValue
        }
        console.log(data);

        this.compareService.editInCompare(data).subscribe({
          next: (response) => {
            if (response.statusCode === 201) {
              console.log(response);
              this.selectedEntry[this.selectedColumn] = result.value;
              this.snackBar.open('Updated Successfully!', 'Close', {
                duration: 3000,
                panelClass: ['custom-toast', 'toast-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            }
          },
          error: (err) => {
            this.snackBar.open('Update Failed', 'Close', {
              duration: 3000,
              panelClass: ['custom-toast', 'toast-error'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            console.log(err);

          }
          
        })
        this.showContextMenu = false;
      }
      this.showContextMenu = false;
    })

    this.showContextMenu = false;
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

  handleSearchQueryChange(): void {

    if (this.searchQuery.trim() === '') {
      this.resetFilteredResults();
      return;
    }
    this.filterResults();
    this.currentPage = 1;
    this.updatePagination();
    this.loading = false;
  }

  private resetFilteredResults(): void {
    this.filteredMatchingProperties = this.matchingProperties.filter(entry => entry.isSame === true);
    this.filteredNonMatchingProperties = this.NonMatchingProperties.filter(entry => entry.isSame === false);
    this.currentPage = 1;
    this.updatePagination();
    this.loading = false;
    return;
  }


  filterResults(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.filteredMatchingProperties = this.matchingProperties.filter(entry => entry.isSame === true);
      this.filteredNonMatchingProperties = this.NonMatchingProperties.filter(entry => entry.isSame === false);
      return;
    }

    // this.filteredRemainingPropertiesSameData = this.filteredRemainingProperties.filter(
    //   entry => entry.isSame === true && this.matchQuery(entry, query)
    // );

    // this.filteredRemainingPropertiesDifferentData = this.filteredRemainingProperties.filter(
    //   entry => entry.isSame === false && this.matchQuery(entry, query)
    // );

    this.filteredMatchingProperties = this.matchingProperties.filter(
      entry => entry.isSame === true && this.matchTenantQuery(entry, query)
    );

    this.filteredNonMatchingProperties = this.NonMatchingProperties.filter(
      entry => entry.isSame === false && this.matchTenantQuery(entry, query)
    );
    this.matchingPropertySize = this.filteredMatchingProperties.length;
    this.nonMatchingPropertySize = this.filteredNonMatchingProperties.length;
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
      (entry.propertyKey && entry.propertyKey.toLowerCase().includes(query)) ||
      (entry[this.selectedTenant1.toLowerCase() + '-' + this.selectedEnv1.toLowerCase()] && entry[this.selectedTenant1.toLowerCase() + '-' + this.selectedEnv1.toLowerCase()].toLowerCase().includes(query)) ||
      (entry[this.selectedTenant2.toLowerCase() + '-' + this.selectedEnv2.toLowerCase()] && entry[this.selectedTenant2.toLowerCase() + '-' + this.selectedEnv2.toLowerCase()].toLowerCase().includes(query))
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

  highlightText(text: string, query: string): any {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const highlighted = text.replace(regex, `<span class="highlight" style="background-color:yellow">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  onRightClick(event: MouseEvent, entry: any, column: any, column2:any): void {
    event.preventDefault();

    this.selectedEntry = entry;
    this.selectedColumn = column;
    this.selectedColumn2 = column2;
    console.log(entry);
    console.log(column);

    this.menuPosition = { x: event.clientX, y: event.clientY };

    this.showContextMenu = true;
  }

  onRightClickForCopy(event: MouseEvent, entry: any, column: any): void {
    console.log("Right clicked for copy");

    event.preventDefault();

    this.selectedEntry = entry;
    this.selectedColumn = column;
    console.log(entry);
    console.log(column);



    this.menuPosition = { x: event.clientX, y: event.clientY };

    this.showContextMenuCopy = true;
  }

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target && !target.closest('.context-menu')) {
      this.showContextMenu = false;
      this.showContextMenuCopy = false;
    }
  }

  get tenantEnv1(): string {
    return `${this.selectedTenant1.toLowerCase()}-${this.selectedEnv1.toLowerCase()}`;
  }
  
  get tenantEnv2(): string {
    return `${this.selectedTenant2.toLowerCase()}-${this.selectedEnv2.toLowerCase()}`;
  }

  get envTenant1():string{
    return `${this.selectedEnv1.toLowerCase()}-${this.selectedTenant1.toLowerCase()}`;
  }

  get envTenant2():string{
    return `${this.selectedEnv2.toLowerCase()}-${this.selectedTenant2.toLowerCase()}`;
  }

  editEntry2(): void {
    const oldValue = this.selectedEntry[this.selectedColumn.name];
    const dialogData = {
      propertyKey: this.selectedEntry['propertykey'],
      tenantEnv: this.selectedColumn.name,
      value: this.selectedEntry[this.selectedColumn.name],
    }

    const dialogRef = this.dialog.open(EditCompareComponent,{
      width: `700px`,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result=>{
      if(result){
        console.log(result);
        const data = {
          tenantEnv: result.tenantEnv,
          propertyKey: result.propertykey,
          newValue: result.value,
          oldValue: oldValue
        }
        console.log(data);
        
        this.compareService.editInCompare(data).subscribe({
          next: (response)=>{
            if(response.statusCode === 201){
              console.log(response);
              this.selectedEntry[this.selectedColumn.name] = data.newValue;
              this.snackBar.open('Updated Successfully!', 'Close', {
                duration: 3000,
                panelClass: ['custom-toast', 'toast-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            }
          },
          error:(err)=>{
            this.snackBar.open('Update Failed', 'Close', {
              duration: 3000,
              panelClass: ['custom-toast', 'toast-error'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            console.log(err);
            
          }
          
        })
      }
      this.showContextMenu = false;
    })
    

    this.showContextMenu = false;
  }

  copyEntry(): void {
    console.log('Copy entry:', this.selectedEntry);
    const text = this.selectedEntry[this.selectedColumn];
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Copied to clipoard!', 'Close', {
        duration: 3000,
        panelClass: ['custom-toast', 'toast-success'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }).catch(err => {
      console.error('Unable to copy text: ', err);
    });
    this.showContextMenu = false;
  }

  copyEntry2(): void {
    const text = this.selectedEntry[this.selectedColumn];
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Copied to clipoard!', 'Close', {
        duration: 3000,
        panelClass: ['custom-toast', 'toast-success'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }).catch(err => {
      console.error('Unable to copy text: ', err);
    });
    this.showContextMenuCopy = false;
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
