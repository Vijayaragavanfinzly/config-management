import { CommonModule } from '@angular/common';
import { Component, HostListener, Renderer2 } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { CompareService } from '../../services/compare-service/compare.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PropertyService } from '../../services/property-service/property.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmCopyPropertyDialogComponent } from '../miscellaneous/dialogs/confirm-copy-property-dialog/confirm-copy-property-dialog.component';
import { UpdateComparePropertyDialogComponent } from '../miscellaneous/dialogs/update-compare-property-dialog/update-compare-property-dialog.component';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { EditCompareComponent } from '../miscellaneous/dialogs/edit-compare/edit-compare.component';
import { ApplicationService } from '../../services/application-service/application.service';
import { EditPropertyCompareComponent } from '../miscellaneous/dialogs/edit-property-compare/edit-property-compare.component';
import { SuccessSnackbarComponent } from '../miscellaneous/snackbar/success-snackbar/success-snackbar.component';
import { ErrorSnackbarComponent } from '../miscellaneous/snackbar/error-snackbar/error-snackbar.component';
import { AddPropertyDialogComponent } from '../miscellaneous/dialogs/add-property-dialog/add-property-dialog.component';
import { AddPropertyCompareComponent } from '../miscellaneous/dialogs/add-property-compare/add-property-compare.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
@Component({
  selector: 'app-compare-by-tenant',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MatTabsModule, MatTooltipModule,MatFormFieldModule,MatSelectModule,NgxMatSelectSearchModule,ReactiveFormsModule],
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
  matchingPropertySize2: number = 0;
  nonMatchingPropertySize2: number = 0;
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
  showContextMenuAdd = false;
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
  hintVisible: boolean = false;
  applications: string[] = [];
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
  filterNonMatchingProperties(): void {
    console.log('Filtering Non-Matching Properties');
    this.showFilterDropdown = false;
  }
  fieldGroups: string[] = ['Global', 'Application', 'Customer']
  targets: string[] = ['config_server', 'parameter_store']
  types: string[] = ['environment', 'tenant', 'client_adapter']
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
    this.handleSearchQueryChange();
    this.updatePagination();
    this.currentPage = 1;
  }
  constructor(private tenantService: TenantService, private compareService: CompareService, private dialog: MatDialog, private propertyService: PropertyService, private snackBar: MatSnackBar, private renderer: Renderer2, private sanitizer: DomSanitizer, private applicationService: ApplicationService) { }
  ngOnInit(): void {
    this.loadAllTenants();
    this.loadApplications();
  }
  loadAllTenants(): void {
    this.tenantService.getAllTenants().subscribe({
      next: (data) => {
        this.tenants = data.data.sort((a: any, b: any) => {
          return a.localeCompare(b);
        });
        console.log(this.tenants);
        this.tenantNames = this.tenants.map((tenant) => tenant.toUpperCase());
      },
      error: (err) => console.error('Error fetching tenants:', err),
    });
  }
  loadApplications(): void {
    this.loading = true;
    this.applicationService.getAllApplications().subscribe({
      next: (data: any) => {
        console.log(data);

        if (data.statusCode == '200') {
          this.applications = data.data;
          console.log(this.applications);
        }
      },
      error: (err) => {
        console.error("Failed to fetch applications:", err);
      },
      complete: () => {
        this.loading = false
        console.log("Application loading process completed.");
      }
    })
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
  compareEnvironments(): void {
    this.searchQuery = ''
    if (this.selectedTenant1 && this.selectedTenant2 && this.selectedEnv1 && this.selectedEnv2) {
      console.log('Comparing environments:', this.selectedEnv1, this.selectedEnv2);
      if (this.selectedTenant1 === this.selectedTenant2 && this.selectedEnv1 === this.selectedEnv2) {
        this.snackBar.openFromComponent(ErrorSnackbarComponent, {
          data: {
            message: `Both Tenant & Environment cannot be same`,
            icon: 'x-circle'
          },
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        return;
      }
      this.compareService.compareTenants(this.selectedTenant1.toLowerCase(), this.selectedEnv1.toLowerCase(), this.selectedTenant2.toLowerCase(), this.selectedEnv2.toLowerCase()).subscribe({
        next: (data) => {
          console.log(data);
          if (data.statusCode === 200) {
            console.log('Comparison result:', data);
            this.properties = data.data;
            this.matchingProperties = this.properties.filter(entry => entry.isSame === true);
            this.NonMatchingProperties = this.properties.filter(entry => entry.isSame === false);
            this.filteredMatchingProperties = [...this.matchingProperties];
            this.filteredNonMatchingProperties = [...this.NonMatchingProperties];
            this.matchingPropertySize = this.matchingProperties.length;
            this.nonMatchingPropertySize = this.NonMatchingProperties.length;
            this.matchingPropertySize2 = this.filteredMatchingProperties.length;
            this.nonMatchingPropertySize2 = this.filteredNonMatchingProperties.length;
            this.currentPage = 1;
            this.updatePagination();
            console.log(this.filteredMatchingProperties);
            console.log(this.filteredNonMatchingProperties);
          }
          else {
            console.log(data);
            console.log(data.message);
            this.snackBar.openFromComponent(ErrorSnackbarComponent, {
              data: {
                message: `${data.message}`,
                icon: 'x-circle'
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
          message: `Please select all the field.`,
          icon: 'x-circle'
        },
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
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
    const endIndex = Math.min(parseInt(startIndex.toString()) + parseInt(this.pageSize.toString()), length);
    console.log(`Start Index: ${startIndex}`);
    console.log(`End Index: ${endIndex}`);
    if (this.activeTab === 'tenant' && this.selectedFilter === 'Matching') {
      return this.filteredMatchingProperties.slice(startIndex, endIndex);
    }
    else if (this.activeTab === 'tenant' && this.selectedFilter !== 'Matching') {
      return this.filteredNonMatchingProperties.slice(startIndex, endIndex);
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
    this.filteredMatchingProperties = [];
    this.filteredNonMatchingProperties = [];
    this.searchQuery = ''
    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
      data: {
        message: `Selection Cleared Successfully !`,
        icon: 'check-circle'
      },
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
    return;
  }





  openConfirmationDialog(propertyKey: string, targetEnvironment: string, newValue: string, oldValue: string) {
    console.log(propertyKey);
    if (newValue === null) {
      this.snackBar.openFromComponent(ErrorSnackbarComponent, {
        data: {
          message: `Transfer cannot proceed as one of the properties is missing a value.`,
          icon: 'x-circle'
        },
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    if (newValue === 'not available' || oldValue === 'not available') {
      this.snackBar.openFromComponent(ErrorSnackbarComponent, {
        data: {
          message: `Transfer cannot proceed as one of the properties is missing a key.`,
          icon: 'x-circle'
        },
        duration: 3000,
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
              this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                data: {
                  message: `Property Updated Successfully !`,
                  icon: 'check-circle'
                },
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              this.compareEnvironments();
            }
          },
          error: (err) => {
            this.snackBar.openFromComponent(ErrorSnackbarComponent, {
              data: {
                message: `Update Failed!`,
                icon: 'check-circle'
              },
              duration: 3000,
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
    const [tenant, env] = this.selectedColumn.split('-');
    const propertyKey = this.selectedEntry['propertyKey'].replace('tenant_id', tenant);;

    const payload = {
      tenant: tenant,
      propertyKey: propertyKey,
      env: env
    }

    this.compareService.getAllConfigData(payload).subscribe({
      next: (res) => {
        console.log(res);
        if (res.statusCode == 200) {
          const dialogConfig = new MatDialogConfig();

          dialogConfig.minWidth = '800px';
          dialogConfig.minHeight = '400px';
          dialogConfig.maxHeight = '580px';
          dialogConfig.maxWidth = '900px';
          dialogConfig.data = {
            applications: this.applications,
            application: res.data.application,
            configId: res.data.configId,
            env: res.data.env,
            fieldGroup: res.data.fieldGroup,
            fieldGroups: this.fieldGroups,
            id: res.data.id,
            isEdit: res.data.isEdit,
            isAdd: res.data.isAdd,
            isDelete: res.data.isDelete,
            label: res.data.label,
            profile: res.data.profile,
            propKey: res.data.propKey,
            propertyType: res.data.propertyType,
            secret: res.data.secret,
            tenant: res.data.tenant,
            tenantEnvId: res.data.tenantEnvId,
            value: res.data.value,
            lastUpdatedBy: res.data.lastUpdatedBy
          };
          const dialogRef = this.dialog.open(EditPropertyCompareComponent, dialogConfig);
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              console.log(result);
              const payload = {
                id: res.data.id,
                isEdit: true,
                isAdd: res.data.isAdd,
                isDelete: res.data.isDelete,
                configId: res.data.configId,
                env: res.data.env,
                tenant: res.data.tenant,
                propKey: res.data.propKey,
                value: result.value,
                application: result.application,
                fieldGroup: result.fieldGroup,
                profile: res.data.profile,
                propertyType: result.propertyType,
                secret: res.data.secret,
                label: result.label,
                tenantEnvId: res.data.tenantEnvId,
                lastUpdatedBy: result.lastUpdatedBy
              };
              this.propertyService.updateProperty(payload).subscribe({
                next: (response) => {
                  console.log(response);
                  if (response.statusCode == 201) {
                    console.log("Property updated Successfully!");
                    this.selectedEntry[this.selectedColumn] = result.value;
                    // this.selectedColumn[this.selectedEntry] = result.value
                    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                      data: {
                        message: `Property Updated Successfully !`,
                        icon: 'check-circle'
                      },
                      duration: 3000,
                      horizontalPosition: 'center',
                      verticalPosition: 'top',
                    });
                    this.compareEnvironments();
                  }
                  else {
                    console.log("Error is updating property");
                    this.snackBar.openFromComponent(ErrorSnackbarComponent, {
                      data: {
                        message: `Update Failed !`,
                        icon: 'check-circle'
                      },
                      duration: 3000,
                      horizontalPosition: 'center',
                      verticalPosition: 'top',
                    });
                  }
                }
              })
            }
          })
        }
      },
      error: (err) => {
        console.log(err);
        this.snackBar.openFromComponent(ErrorSnackbarComponent, {
          data: {
            message: `Error Occured while updating properties`,
            icon: 'check-circle'
          },
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    })
    this.showContextMenu = false;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.openFromComponent(SuccessSnackbarComponent, {
        data: {
          message: `Copied to clipboard !`,
          icon: 'check-circle'
        },
        duration: 3000,
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
    this.matchingPropertySize2 = this.filteredMatchingProperties.length;
    this.nonMatchingPropertySize2 = this.filteredNonMatchingProperties.length;
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

    this.filteredMatchingProperties = this.matchingProperties.filter(
      entry => entry.isSame === true && this.matchTenantQuery(entry, query)
    );

    this.filteredNonMatchingProperties = this.NonMatchingProperties.filter(
      entry => entry.isSame === false && this.matchTenantQuery(entry, query)
    );
    this.matchingPropertySize2 = this.filteredMatchingProperties.length;
    this.nonMatchingPropertySize2 = this.filteredNonMatchingProperties.length;
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
    if (!text) return '';

    text = text.replace(/tenant_id/gi, `<span class="highlight" style="font-weight:bold; color:black">tenant_id</span>`);

    if (query) {
      const regex = new RegExp(`(${query})`, 'gi');
      text = text.replace(regex, `<span class="highlight" style="background-color:yellow">$1</span>`);
    }
    return this.sanitizer.bypassSecurityTrustHtml(text);
  }


  onRightClick(event: MouseEvent, entry: any, column: any, column2: any): void {
    event.preventDefault();

    this.selectedEntry = entry;
    this.selectedColumn = column;
    this.selectedColumn2 = column2;
    console.log(entry);
    console.log(column);

    this.menuPosition = { x: event.clientX, y: event.clientY };

    this.showContextMenu = true;
  }

  onRightClickAdd(event: MouseEvent, entry:any, column:any,column2:any):void{
    event.preventDefault();
    console.log(entry);
    console.log(column);
    console.log(column2);

    this.selectedEntry = entry;
    this.selectedColumn = column;
    this.selectedColumn2 = column2;

    this.menuPosition = { x: event.clientX, y: event.clientY };
    
    this.showContextMenuAdd = true;
    
    
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
      this.showContextMenuAdd = false;
    }
  }

  get tenantEnv1(): string {
    return `${this.selectedTenant1.toLowerCase()}-${this.selectedEnv1.toLowerCase()}`;
  }

  get tenantEnv2(): string {
    return `${this.selectedTenant2.toLowerCase()}-${this.selectedEnv2.toLowerCase()}`;
  }

  get envTenant1(): string {
    return `${this.selectedEnv1.toLowerCase()}-${this.selectedTenant1.toLowerCase()}`;
  }

  get envTenant2(): string {
    return `${this.selectedEnv2.toLowerCase()}-${this.selectedTenant2.toLowerCase()}`;
  }

  editEntry2(): void {
    const oldValue = this.selectedEntry[this.selectedColumn.name];
    const dialogData = {
      propertyKey: this.selectedEntry['propertykey'],
      tenantEnv: this.selectedColumn.name,
      value: this.selectedEntry[this.selectedColumn.name],
    }

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
              this.selectedEntry[this.selectedColumn.name] = data.newValue;
              this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                data: {
                  message: `Updated Successfully !`,
                  icon: 'check-circle'
                },
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              this.compareEnvironments();
            }
          },
          error: (err) => {
            this.snackBar.openFromComponent(ErrorSnackbarComponent, {
              data: {
                message: `Update Failed !`,
                icon: 'check-circle'
              },
              duration: 3000,
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
      this.snackBar.openFromComponent(SuccessSnackbarComponent, {
        data: {
          message: `Copied to clipboard !`,
          icon: 'check-circle'
        },
        duration: 3000,
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
      this.snackBar.openFromComponent(SuccessSnackbarComponent, {
        data: {
          message: `Copied to clipboard !`,
          icon: 'check-circle'
        },
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }).catch(err => {
      console.error('Unable to copy text: ', err);
    });
    this.showContextMenuCopy = false;
  }

  addProperty2(){
    console.log(this.selectedColumn);
    console.log(this.selectedEntry);
    console.log(this.selectedColumn2);

    const [tenant,env] = this.selectedColumn.split('-');

    const propertyKey = this.selectedEntry['propertyKey'].replace('tenant_id',tenant);
    
    const dialogConfig = new MatDialogConfig();
    
        dialogConfig.minWidth = '800px'; 
        dialogConfig.minHeight = '400px';
        dialogConfig.maxHeight = '580px';
        dialogConfig.maxWidth = '900px';
        dialogConfig.data = {
          application: this.applications,
          configId:'',
          env: env,
          fieldGroup: this.fieldGroups,
          id: null,
          isEdit:'',
          label:'',
          profile:'',
          propKey: propertyKey,
          propertyType:'',
          secret:'',
          tenant: tenant,
          tenantEnvId:'',
          value: '',
          lastUpdatedBy:''
          
        };
    
        const dialogRef = this.dialog.open(AddPropertyCompareComponent, dialogConfig);
        
        dialogRef.afterClosed().subscribe((result) => {
          console.log(result);
          if (result) {
            const payload = {
              env: env,
              tenant: tenant,
              propKey: propertyKey,
              value: result.value.trim(),
              application: result.application,
              fieldGroup: result.fieldGroup,
              profile:env,
              lastUpdatedBy:result.lastUpdatedBy,
              secret:null,
              target: result.target,
              label:result.label
            };
            this.propertyService.addProperty(payload).subscribe({
              next: (response) => {
                console.log(response);
                if (response.statusCode === 200) {
                  this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                    data: {
                      message: `Configuration Added Successfully !`,
                      icon: 'check-circle'
                    },
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                  });
                  this.selectedEntry[this.selectedColumn] = result.value;
                  this.compareEnvironments();
                  this.clearSearch();
                } else {
                    this.snackBar.openFromComponent(ErrorSnackbarComponent, {
                    data: {
                      message: `${response.message}`,
                      icon: 'check-circle'
                    },
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                  });
                }
              },
              error: (err) => {
                console.log(err);
                this.snackBar.openFromComponent(ErrorSnackbarComponent, {
                  data: {
                    message: `Failed to create the configuration. Please try again.`,
                    icon: 'check-circle'
                  },
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                });
                console.error('Error adding property:', err);
              }
            })
          }
          this.showContextMenuAdd = false;
        });
    this.showContextMenuAdd = false;
  }


  clearSearch() {
    this.searchQuery = '';
    this.handleSearchQueryChange();
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
    this.currentPage = 1;
    this.updatePagination();
  }

  showHintContent() {
    this.hintVisible = true;
  }

  closeHint() {
    this.hintVisible = false;
  }
  showSidebar: boolean = false;
  toggleInfoSidebar() {
    this.showSidebar = !this.showSidebar;
  }
}
