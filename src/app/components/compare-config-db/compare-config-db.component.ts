import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { debounceTime, startWith, map } from 'rxjs/operators';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommonModule } from '@angular/common';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { CompareService } from '../../services/compare-service/compare.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PropertyService } from '../../services/property-service/property.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmCopyPropertyDialogComponent } from '../miscellaneous/dialogs/confirm-copy-property-dialog/confirm-copy-property-dialog.component';
import { UpdateComparePropertyDialogComponent } from '../miscellaneous/dialogs/update-compare-property-dialog/update-compare-property-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpinnerComponent } from "../miscellaneous/spinner/spinner.component";
import { ComparisonDialogComponent } from '../miscellaneous/dialogs/comparison-dialog/comparison-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-compare-config-db',
  standalone: true,
  imports: [RouterModule, MatFormFieldModule, MatSelectModule, NgxMatSelectSearchModule, CommonModule, FormsModule, ReactiveFormsModule, MatTooltipModule, SpinnerComponent],
  templateUrl: './compare-config-db.component.html',
  styleUrl: './compare-config-db.component.css'
})
export class CompareConfigDbComponent implements OnInit {
  filteredOptions: string[] = [];
  searchControl = new FormControl('');
  searchInput = new FormControl('');

  environments: string[] = [];
  selectedEnv1: string = '';
  selectedEnv2: string = '';

  tenants: any[] = [];
  tenantNames: string[] = [];
  selectedTenant1: string = '';
  selectedTenant2: string = '';
  tenant1Environments: string[] = [];
  tenant2Environments: string[] = [];
  allEnvironments: string[] = [];
  loading: boolean = false;
  comparisonData: any[] = [];
  totalSize: number = 0;
  filteredSameData: any[] = [];
  filteredDifferentData: any[] = [];
  hoveredRow: any = null;
  matchingPropertySize: number = 0;
  nonMatchingPropertySize: number = 0;


  TenantBasedProperties: any[] = [];
  CommonProperties: any[] = [];
  TenantMatchingProperties: any[] = [];
  TenantNonMatchingProperties: any[] = [];
  CommonMatchingProperties: any[] = [];
  CommonNonMatchingProperties: any[] = [];

  filteredCommonMatchingProperties: any[] = [];
  filteredCommonNonMaatchingProperties: any[] = [];
  filteredTenantMatchingProperties: any[] = [];
  filteredTenantNonMatchingProperties: any[] = [];

  tenantBasedKeys: any = [];
  commonBasedKeys: any = [];

  tenantBasedSized: number = 0;
  nonTenantBasedSize: number = 0;
  tenantPropertySameSize: number = 0;
  tenantPropertyDifferentSize: number = 0;
  nonTenantPropertySameSize: number = 0;
  nonTenantPropertyDifferentSize: number = 0;

  sizeOfCommonMatching: number = 0;
  sizeOfCommonNonMatching: number = 0;
  sizeOfTenantMatching: number = 0;
  sizeOfTenantNonMatching: number = 0;



  tenantsOfEnv1: string[] = [];
  tenantsOfEnv2: string[] = [];



  paginatedTenantProperties: any[] = [];
  paginatedNonTenantProperties: any[] = [];
  paginatedTenantSameProperties: any[] = [];
  paginatedTenantDifferentProperties: any[] = [];
  paginatedNonTenantSameProperties: any[] = [];
  paginatedNonTenantDifferentProperties: any[] = [];

  paginatedSameData: any[] = [];
  paginatedDifferentData: any[] = [];

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

  showContextMenu = false;
  menuPosition = { x: 0, y: 0 };
  selectedEntry: any;
  selectedColumn: any;

  showOverlayHint = false;

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

  filterNonMatchingProperties(): void {
    console.log('Filtering Non-Matching Properties');
    this.showFilterDropdown = false;
  }


  // Columns 
  tenantsAvailableInEnv1: string[] = [];
  tenantsAvailableInEnv2: string[] = [];

  commonPropertiesColumns = [
    { name: 'Property Key', field: 'propertyKey', width: 150 },
    { name: 'Property Value', field: 'PropertyValue1', width: 150 },
  ];

  commonPropertiesColumns_different = [
    { name: 'Property Key', field: 'propertyKey', width: 200 },
    { name: 'Property Value 1', field: 'PropertyValue1', width: 200 },
    { name: 'Actions', field: 'actionsT1', width: 100 },
    { name: 'Property Value 2', field: 'PropertyValue2', width: 200 },
  ]

  tenantPropertiesColumn_same = [
    { name: 'Property Key', field: 'masterKey', width: 150 },
    { name: 'Property Value', field: 'propertyValue1', width: 150 },
  ]

  differentColumns: any = [];

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




  ngOnInit() {
    this.getAllEnvironments();
  }


  getAllEnvironments(): void {
    this.compareService.getAllEnvironments().subscribe({
      next: (data) => {
        this.environments = data.data;

      },
      error: (err) => {
        console.log("Error Fetching Environments");

      }
    })
  }

  compareEnvironments(): void {
    if (this.selectedEnv1 && this.selectedEnv2) {
      console.log('Comparing environments:', this.selectedEnv1, this.selectedEnv2);
      if (this.selectedEnv1 === this.selectedEnv2) {
        this.snackBar.open('Both Environments cannot be same', 'Close', {
          duration: 3000,
          panelClass: ['custom-toast', 'toast-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        return;
      }
      this.loading = true;
      this.compareService.compareLiveEnvironments(this.selectedEnv1.toLowerCase(), this.selectedEnv2.toLowerCase()).subscribe({
        next: (data) => {
          console.log('Comparison result:', data);
          this.comparisonData = data;

          this.TenantBasedProperties = data.tenantBasedProperties;
          this.CommonProperties = data.commonProperties;

          this.tenantBasedSized = this.TenantBasedProperties.length;
          this.nonTenantBasedSize = this.CommonProperties.length;

          this.CommonMatchingProperties = this.CommonProperties.filter(property => property.isSame === true);
          this.CommonNonMatchingProperties = this.CommonProperties.filter(property => property.isSame === false);

          this.TenantMatchingProperties = this.TenantBasedProperties.filter(property => property.issame === true);
          this.TenantNonMatchingProperties = this.TenantBasedProperties.filter(property => property.issame === false);

          this.filteredCommonMatchingProperties = [...this.CommonMatchingProperties];
          this.filteredCommonNonMaatchingProperties = [...this.CommonNonMatchingProperties];
          this.filteredTenantMatchingProperties = [...this.TenantMatchingProperties];
          this.filteredTenantNonMatchingProperties = [...this.TenantNonMatchingProperties];

          this.sizeOfCommonMatching = this.filteredCommonMatchingProperties.length;
          this.sizeOfCommonNonMatching = this.filteredCommonNonMaatchingProperties.length;
          this.sizeOfTenantMatching = this.filteredTenantMatchingProperties.length;
          this.sizeOfTenantNonMatching = this.filteredTenantNonMatchingProperties.length;

          // console.log(this.TenantMatchingProperties);
          // console.log(this.TenantNonMatchingProperties);
          const keys = Object.keys(data.tenants);
          this.tenantsOfEnv1 = data.tenants[keys[0]];
          this.tenantsOfEnv2 = data.tenants[keys[1]];

          console.log(this.tenantsOfEnv1);
          console.log(this.tenantsOfEnv2);





          this.tenantPropertySameSize = this.TenantMatchingProperties.length;
          this.tenantPropertyDifferentSize = this.TenantNonMatchingProperties.length;
          this.nonTenantPropertySameSize = this.CommonMatchingProperties.length;
          this.nonTenantPropertyDifferentSize = this.CommonNonMatchingProperties.length;

          if (data && data.tenantBasedProperties && data.tenantBasedProperties.length > 0) {
            const tenantKeys = Object.keys(data.tenantBasedProperties[0]);
            console.log(tenantKeys);

            this.differentColumns = [
              { name: 'Property Key', field: 'propertyKey', width: 300 },
              ...tenantKeys
                .filter((key) => key !== 'propertykey' && key !== 'issame') // Filter out unwanted keys
                .map((key) => ({
                  name: key,
                  field: key,
                  width: 300,
                })),
              { name: 'Action', field: 'Action', width: 300 },
            ];
          } else {
            console.log('data.tenants is undefined or invalid.');
          }

          console.log(this.differentColumns);

          this.columnConfigurations['different'] = this.differentColumns;
          console.log('Updated columnConfigurations:', this.columnConfigurations);

          const hintSeen = localStorage.getItem('tableHintSeen');
          if (!hintSeen) {
            setTimeout(() => this.showOverlayHint = true, 1000);
            localStorage.setItem('tableHintSeen', 'true');
          } else {
            setTimeout(() => this.showOverlayHint = false, 1000);
          }
          console.log('Show Overlay:', this.showOverlayHint);

          this.currentPage = 1;
          this.updatePagination();
        },
        error: (err) => {
          console.error('Error comparing environments:', err);
          this.snackBar.open('Error while comparing environments', 'Close', {
            duration: 3000,
            panelClass: ['custom-toast', 'toast-error'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
        complete: () => {
          this.loading = false;
        }
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
    if (this.activeTab === 'tenant' && this.selectedFilter === 'Matching') {
      this.totalPages = Math.ceil(this.filteredTenantMatchingProperties.length / this.pageSize);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      this.pages = this.getVisiblePages();
      this.paginatedTenantSameProperties = this.getPaginatedData();
    }
    else if (this.activeTab === 'tenant' && this.selectedFilter !== 'Matching') {
      this.totalPages = Math.ceil(this.filteredTenantNonMatchingProperties.length / this.pageSize);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      this.pages = this.getVisiblePages();
      this.paginatedTenantDifferentProperties = this.getPaginatedData();
    }
    else if (this.activeTab === 'common' && this.selectedFilter === 'Matching') {
      this.totalPages = Math.ceil(this.filteredCommonMatchingProperties.length / this.pageSize);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      this.pages = this.getVisiblePages();
      this.paginatedSameData = this.getPaginatedData();
      console.log(this.paginatedSameData);
    }
    else if (this.activeTab === 'common' && this.selectedFilter !== 'Matching') {
      this.totalPages = Math.ceil(this.filteredCommonNonMaatchingProperties.length / this.pageSize);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      this.pages = this.getVisiblePages();
      this.paginatedDifferentData = this.getPaginatedData();
    }
  }

  getPaginatedData(): any {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    let length = 0;
    if (this.activeTab === 'tenant' && this.selectedFilter === 'Matching') {
      length = this.filteredTenantMatchingProperties.length;
      this.sizeOfTenantMatching = length;
    }
    else if (this.activeTab === 'tenant' && this.selectedFilter !== 'Matching') {
      length = this.filteredTenantNonMatchingProperties.length;
      this.sizeOfTenantNonMatching = length;
    }
    else if (this.activeTab === 'common' && this.selectedFilter === 'Matching') {
      length = this.filteredCommonMatchingProperties.length;
      this.sizeOfCommonMatching = length;
    }
    else if (this.activeTab === 'common' && this.selectedFilter !== 'Matching') {
      length = this.filteredCommonNonMaatchingProperties.length;
      this.sizeOfCommonNonMatching = length;
    }
    const endIndex = Math.min(parseInt(startIndex.toString()) + parseInt(this.pageSize.toString()), length);

    console.log(`Start Index: ${startIndex}`);
    console.log(`End Index: ${endIndex}`);

    if (this.activeTab === 'tenant' && this.selectedFilter === 'Matching') {
      return this.filteredTenantMatchingProperties.slice(startIndex, endIndex);
    }
    else if (this.activeTab === 'tenant' && this.selectedFilter !== 'Matching') {
      return this.filteredTenantNonMatchingProperties.slice(startIndex, endIndex);
    }
    else if (this.activeTab === 'common' && this.selectedFilter === 'Matching') {
      return this.filteredCommonMatchingProperties.slice(startIndex, endIndex);
    }
    else if (this.activeTab === 'common' && this.selectedFilter !== 'Matching') {
      return this.filteredCommonNonMaatchingProperties.slice(startIndex, endIndex);
    }
  }

  getFirstTenantValue(entry: any): string {
    for (const key in entry) {
      // if (key.startsWith(this.selectedEnv1) && entry[key]) {
      //   return entry[key];
      // }
      if (key.startsWith(`${this.selectedEnv1}-`) && entry[key]) {
        return entry[key];
      }
    }
    return '-';
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

    this.filteredDifferentData = [];
    this.filteredSameData = [];
    this.TenantNonMatchingProperties = [];
    this.TenantMatchingProperties = [];
    this.CommonMatchingProperties = [];
    this.CommonNonMatchingProperties = [];

    this.tenantBasedKeys = [];
    this.commonBasedKeys = [];
    this.CommonProperties = [];
    this.TenantBasedProperties = [];
    this.nonTenantPropertyDifferentSize = 0;
    this.nonTenantPropertySameSize = 0;
    this.tenantPropertySameSize = 0;
    this.tenantPropertyDifferentSize = 0;

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
        environment: targetEnvironment,
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

  openDialog(entry: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '800px';
    dialogConfig.minHeight = '400px';
    dialogConfig.maxHeight = '580px';
    dialogConfig.maxWidth = '900px';
    dialogConfig.data = {
      entry: entry,
      tenantsInEnv1: this.tenantsOfEnv1,
      tenantsInEnv2: this.tenantsOfEnv2
    };
    const dialogRef = this.dialog.open(ComparisonDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
    })
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
      this.snackBar.open('Property Value Copied to clipoard!', 'Close', {
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
    this.filteredTenantMatchingProperties = this.TenantBasedProperties.filter(entry => entry.issame === true);
    this.filteredTenantNonMatchingProperties = this.TenantBasedProperties.filter(entry => entry.issame === false);
    this.filteredCommonMatchingProperties = this.CommonProperties.filter(entry => entry.isSame === true);
    this.filteredCommonNonMaatchingProperties = this.CommonProperties.filter(entry => entry.isSame === false);
    this.currentPage = 1;
    this.updatePagination();
    this.loading = false;
    return;
  }


  filterResults(): void {
    const query = this.searchQuery.trim().toLowerCase();
    console.log("Search Initiated");

    if (!query) {
      this.filteredTenantMatchingProperties = this.TenantBasedProperties.filter(entry => entry.issame === true);
      this.filteredTenantNonMatchingProperties = this.TenantBasedProperties.filter(entry => entry.issame === false);
      this.filteredCommonMatchingProperties = this.CommonProperties.filter(entry => entry.isSame === true);
      this.filteredCommonNonMaatchingProperties = this.CommonProperties.filter(entry => entry.isSame === false);
      this.currentPage = 1;
      this.updatePagination();
      this.loading = false;
      return;
    }

    this.filteredCommonMatchingProperties = this.CommonProperties.filter(
      entry => entry.isSame === true && this.matchQuery(entry, query)
    );

    this.filteredCommonNonMaatchingProperties = this.CommonProperties.filter(
      entry => entry.isSame === false && this.matchQuery(entry, query)
    );

    this.filteredTenantMatchingProperties = this.TenantBasedProperties.filter(
      entry => entry.issame === true && this.matchTenantQuery(entry, query)
    );
    this.filteredTenantNonMatchingProperties = this.TenantBasedProperties.filter(
      entry => entry.issame === false && this.matchTenantQuery(entry, query)
    );

    this.sizeOfCommonMatching = this.filteredCommonMatchingProperties.length;
    this.sizeOfCommonNonMatching = this.filteredCommonNonMaatchingProperties.length;
    this.sizeOfTenantMatching = this.filteredTenantMatchingProperties.length;
    this.sizeOfTenantNonMatching = this.filteredTenantNonMatchingProperties.length;
  }

  private matchQuery(entry: any, query: string): boolean {
    return (
      (entry.propertyKey && entry.propertyKey.toLowerCase().includes(query)) ||
      (entry.env1Value && entry.env1Value.toLowerCase().includes(query)) ||
      (entry.env2Value && entry.env2Value.toLowerCase().includes(query))
    );
  }

  // private matchTenantQuery(entry: any, query: string): boolean {
  //   return (
  //     (entry.masterKey && entry.masterKey.toLowerCase().includes(query)) ||
  //     (entry.propertyKey1 && entry.propertyKey1.toLowerCase().includes(query)) ||
  //     (entry.propertyKey2 && entry.propertyKey2.toLowerCase().includes(query)) ||
  //     (entry.value1 && entry.value1.toLowerCase().includes(query)) ||
  //     (entry.value2 && entry.value2.toLowerCase().includes(query))
  //   )
  // }

  private matchTenantQuery(entry: any, query: string): boolean {
    if (entry.propertykey && entry.propertykey.toLowerCase().includes(query)) {
      return true;
    }

    for (const key in entry) {
      if (
        key.startsWith(this.selectedEnv1 || this.selectedEnv2) &&
        entry[key] &&
        entry[key].toLowerCase().includes(query)
      ) {
        return true;
      }
    }

    return false;
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
    console.log(this.columnConfigurations);

    if (!columns || columns.length <= columnIndex || !columns[columnIndex].width) {
      console.error('Invalid column configuration or missing width');
      return;
    }
    this.startWidth = columns[this.currentColumnIndex].width;

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

    if (this.tableType === 'different') {
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

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.updatePagination();
    this.currentPage = 1;
  }

  highlightText(text: string, query: string): any {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const highlighted = text.replace(regex, `<span class="highlight" style="background-color:yellow">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  onRightClick(event: MouseEvent, entry: any, column: any): void {
    event.preventDefault();

    this.selectedEntry = entry;
    this.selectedColumn = column;

    this.menuPosition = { x: event.clientX, y: event.clientY };

    this.showContextMenu = true;
  }

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target && !target.closest('.context-menu')) {
      this.showContextMenu = false;
    }
  }


  editEntry(): void {
    console.log('Edit entry:', this.selectedEntry);
    console.log(this.selectedColumn);

    this.showContextMenu = false;
  }

  swapEntry(): void {
    console.log('Swap entry:', this.selectedEntry);
    this.showContextMenu = false;
  }

  copyEntry(): void {
    console.log('Copy entry:', this.selectedEntry);
    this.showContextMenu = false;
  }

  hideOverlay(): void {
    this.showOverlayHint = false;
  }

}
