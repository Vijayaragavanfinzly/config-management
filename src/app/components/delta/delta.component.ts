import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { CompareService } from '../../services/compare-service/compare.service';
import { MatDialog } from '@angular/material/dialog';
import { PropertyService } from '../../services/property-service/property.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ErrorSnackbarComponent } from '../miscellaneous/snackbar/error-snackbar/error-snackbar.component';
import { SuccessSnackbarComponent } from '../miscellaneous/snackbar/success-snackbar/success-snackbar.component';

@Component({
  selector: 'app-delta',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MatTabsModule, NgSelectComponent, MatTooltipModule, MatFormFieldModule, MatSelectModule, NgxMatSelectSearchModule, ReactiveFormsModule],
  templateUrl: './delta.component.html',
  styleUrl: './delta.component.css'
})
export class DeltaComponent implements OnInit {
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


  properties: any[] = [];
  filteredProperties: any[] = [];

  paginatedProperties: any[] = [];

  propertySize: number = 0;
  filteredSize: number = 0;

  showContextMenu = false;
  showContextMenuCopy = false;
  menuPosition = { x: 0, y: 0 };
  selectedEntry: any;
  selectedColumn: any;
  selectedColumn2: any;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  pages: number[] = [];


  activeTab: string = 'tenant';
  showFilter: boolean = false;
  searchQuery: string = '';
  showSearchBar: boolean = false;

  showFilterDropdown: boolean = false;

  hintVisible: boolean = false;

  searchInput = new FormControl('');



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

  deltaColumn = [
    { name: 'Property Key', field: 'property key', width: 400 },
    { name: 'Property Value', field: 'property value', width: 400 }
  ]

  columnConfigurations: { [key: string]: any[] } = {
    common: this.commonPropertiesColumns,
    common_different: this.commonPropertiesColumns_different,
    tenant_same: this.tenantPropertiesColumn_same,
    different: this.differentColumns,
    deltaColumn: this.deltaColumn
  };

  private startX: number = 0;
  private startWidth: number = 0;
  private currentColumnIndex: number = 0;
  private tableType: string = '';
  private removeListeners: Function[] = [];

  flag: boolean = false;
  flag2: boolean = false;

  private readonly MIN_COLUMN_WIDTH = 100;

  showDropdown: boolean = false;
  selectedFilter: string = 'Matching';

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  selectFilter(option: string) {
    this.selectedFilter = option;
    this.showDropdown = false;
    // this.updatePagination();
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
        this.tenantNames = this.tenants.map((tenant) => tenant.toUpperCase());
      },
      error: (err) => console.error('Error fetching tenants:', err),
    });
  }

  loadEnvironmentsForTenant(tenantKey: string): void {
    this.loading = true;
    const selectedTenant = tenantKey === 'tenant1' ? this.selectedTenant1.toLowerCase() : this.selectedTenant2.toLowerCase();

    this.tenantService.getTenantEnvironments(selectedTenant).subscribe({
      next: (data) => {
        const environments = data.data;
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

  findDelta() {
    if (this.selectedTenant1 && this.selectedTenant2 && this.selectedEnv1 && this.selectedEnv2) {
      console.log('Comparing environments:', this.selectedEnv1, this.selectedEnv2);
      if (this.selectedTenant1 === this.selectedTenant2 && this.selectedEnv1 === this.selectedEnv2) {
        this.snackBar.openFromComponent(ErrorSnackbarComponent, {
          data: {
            message: `Both Tenant & Environment cannot be same !`,
            icon: 'check-circle'
          },
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        return;
      }
      this.compareService.getDelta(this.selectedTenant1.toLowerCase(), this.selectedEnv1.toLowerCase(), this.selectedTenant2.toLowerCase(), this.selectedEnv2.toLowerCase()).subscribe({
        next: (data) => {
          console.log(data);
          this.flag = true;
          if (data.statusCode === 200) {
            console.log('Missing key result:', data);
            this.properties = data.data;
            this.filteredProperties = [...this.properties];
            this.currentPage = 1;
            this.updatePagination();
            console.log(this.filteredProperties);
            this.propertySize = this.properties.length;
            this.filteredSize = this.filteredProperties.length;
          }
          else {
            console.log(data);
            console.log(data.message);
            this.snackBar.openFromComponent(ErrorSnackbarComponent, {
              data: {
                message: `${data.message} !`,
                icon: 'check-circle'
              },
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }


        },
        error: (err) => console.error('Error comparing environments:', err),
      });
    } else {
      this.snackBar.openFromComponent(ErrorSnackbarComponent, {
        data: {
          message: `Please fill all the required fields !`,
          icon: 'check-circle'
        },
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }

  updatePagination() {

    this.totalPages = Math.ceil(this.filteredProperties.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.pages = this.getVisiblePages();
    this.paginatedProperties = this.getPaginatedData();

  }

  getPaginatedData(): any {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    let length = 0;
    length = this.filteredProperties.length;
    const endIndex = Math.min(parseInt(startIndex.toString()) + parseInt(this.pageSize.toString()), length);

    console.log(`Start Index: ${startIndex}`);
    console.log(`End Index: ${endIndex}`);
    return this.filteredProperties.slice(startIndex, endIndex);
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
    this.searchQuery = '';
    this.selectedTenant1 = '';
    this.selectedTenant2 = '';
    this.selectedEnv1 = '';
    this.selectedEnv2 = '';
    this.tenant1Environments = [];
    this.tenant2Environments = [];
    this.properties = [];
    this.filteredProperties = [];
    this.paginatedProperties = [];
    this.flag2 = false;
    // this.handleSearchQueryChange();
    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
      data: {
        message: `Comparison Cleared Successfully !`,
        icon: 'check-circle'
      },
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }


  highlightText(text: string, query: string): any {
    if (!text) return '';

    text = text.replace(/tenant_id/gi, `<span class="highlight" style="font-weight:bold; color:black">tenant_id</span>`);

    if (query) {
      const regex = new RegExp(`(${query})`, 'gi');
      text = text.replace(regex, `<span class="highlight" style="background-color:yellow">$1</span>`);
    }
    return this.sanitizer.bypassSecurityTrustHtml(text);
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
    this.filteredProperties = this.properties;
    this.filteredSize = this.filteredProperties.length;
    this.currentPage = 1;
    this.updatePagination();
    this.loading = false;
    return;
  }


  filterResults(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.filteredProperties = this.properties;
      return;
    }

    this.filteredProperties = this.properties.filter((entry) =>
      this.matchTenantQuery(entry, query)
    );

    this.filteredSize = this.filteredProperties.length;
  }
  private matchTenantQuery(entry: any, query: string): boolean {
    return (
      (entry.propKey && entry.propKey.toLowerCase().includes(query)) ||
      (entry.value && entry.value.toLowerCase().includes(query))
    )
  }

  clearSearch() {
    this.searchQuery = '';
    this.handleSearchQueryChange();
  }

}
