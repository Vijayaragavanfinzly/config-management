import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Property } from '../../model/property.interface';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PropertyService } from '../../services/property-service/property.service';
import { ConfirmationDialogComponent } from '../miscellaneous/dialogs/confirmation-dialog/confirmation-dialog.component';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../miscellaneous/spinner/spinner.component';
import { AddPropertyDialogComponent } from '../miscellaneous/dialogs/add-property-dialog/add-property-dialog.component';
import { PropertyDialogComponent } from '../miscellaneous/dialogs/edit-property-dialog/edit-property-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExportService } from '../../services/export-service/export.service';
import { ApplicationService } from '../../services/application-service/application.service';
import { MatDialogConfig } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ExportConfirmationComponent } from '../miscellaneous/dialogs/export-confirmation/export-confirmation.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SuccessSnackbarComponent } from '../miscellaneous/snackbar/success-snackbar/success-snackbar.component';
import { ErrorSnackbarComponent } from '../miscellaneous/snackbar/error-snackbar/error-snackbar.component';

@Component({
  selector: 'app-tenant-environment-properties',
  standalone: true,
  imports: [RouterModule, SpinnerComponent, CommonModule, MatDialogModule, MatButtonModule, FormsModule, MatSidenavModule, MatIconModule, MatInputModule, MatSelectModule, NgSelectComponent, MatTooltipModule],
  templateUrl: './tenant-environment-properties.component.html',
  styleUrl: './tenant-environment-properties.component.css'
})
export class TenantEnvironmentPropertiesComponent implements OnInit {

  tenant: string = '';
  environment: string = '';
  properties: any[] = [];
  filteredProperties: any[] = [];
  paginatedProperties: any[] = [];
  searchKeyword: string = '';
  loading: Boolean = false;
  selectedIds: string[] = [];
  isAllSelected: boolean = false;

  propertySize: number = 0;

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  pages: number[] = []

  columns = [
    { name: 'Property Key', field: 'propertyKey', width: 300 },
    { name: 'Property Value', field: 'PropertyValue', width: 300 },
    // {name: 'Release Version', field:'releaseVersion', width:150},
    { name: 'Actions', field: 'actions', width: 150 },
  ];

  private startX: number = 0;
  private startWidth: number = 0;
  private currentColumnIndex: number = 0;
  private tableType: string = '';
  private removeListeners: Function[] = [];

  private readonly MIN_COLUMN_WIDTH = 100;

  showSearchDrawer = false;
  advancedSearch = {
    keyword: '',
    application: '',
    fieldGroup: '',
    type: '',
    target: '',
  }
  release: string = '';
  isDrawerOpen = false;

  fieldGroups: string[] = ['Global', 'Application', 'Customer']
  targets: string[] = ['config_server', 'parameter_store']
  types: string[] = ['environment', 'tenant', 'client_adapter']

  applications: string[] = [];


  constructor(private route: ActivatedRoute,
    private dialog: MatDialog, private propertyService: PropertyService, private snackBar: MatSnackBar, private renderer: Renderer2, private exportService: ExportService, private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.environment = param['environment']
      this.tenant = param['tenant']
      if (this.environment && this.tenant) {
        this.loadPropertiesForTenants();
        this.loadApplications();
      }
    })
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyoardToggle(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.isDrawerOpen = false;
    }
  }

  loadPropertiesForTenants() {
    this.loading = true;
    this.propertyService.getTenantProperties(this.tenant, this.environment).subscribe({
      next: (data: any) => {
        console.log(data);

        this.properties = data.data;
        console.log(this.properties);
        this.filteredProperties = [...this.properties];
        this.propertySize = this.filteredProperties.length;
        this.currentPage = 1;
        // this.release = this.properties[0].release;
        this.updatePagination();
        console.log("Loaded properties for " + this.tenant + " " + this.environment, this.properties);
        console.log(this.filteredProperties);
      },
      error: (err) => {
        console.error("Error fetching properties for tenant:", err);
      },
      complete: () => {
        this.loading = false
      }
    })
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

  filterProperties() {
    this.loading = true;
    if (this.searchKeyword.trim()) {
      this.filteredProperties = this.properties.filter(property => {
        const key = property.propertyKey || "";
        const value = property.propertyValue || "";
        return (
          key.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          value.toLowerCase().includes(this.searchKeyword.toLowerCase())
        );
      });
    } else {
      this.filteredProperties = [...this.properties];
    }
    this.currentPage = 1;
    this.updatePagination();
    this.loading = false;
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredProperties.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.pages = this.getVisiblePages();
    this.paginatedProperties = this.getPaginatedData();
  }

  getPaginatedData(): Property[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(parseInt(startIndex.toString()) + parseInt(this.pageSize.toString()), this.filteredProperties.length);

    console.log(`Start Index: ${startIndex}`);
    console.log(`End Index: ${endIndex}`);

    return this.filteredProperties.slice(startIndex, endIndex);
  }



  getVisiblePages(): number[] {
    const maxPagesToShow = 5; // Total pages to show (current + 2 before + 2 after)
    const visiblePages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    // Show first page and last page if not in range
    if (startPage > 1) {
      visiblePages.push(1);
      if (startPage > 2) visiblePages.push(-1); // Ellipsis
    }

    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) visiblePages.push(-1); // Ellipsis
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


  clearSearch(): void {
    this.searchKeyword = '';
    this.filterProperties();
    this.resetSearch();
  }

  exportProperties(): void {
    if (this.selectedIds.length === 0) {
      const dialogRef = this.dialog.open(ExportConfirmationComponent, {
        width: '600px',
      });
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.exportAllProperties();
        } else {
          console.log('Export cancelled');
        }
      });
    } else {
      this.exportSelectedProperties();
    }
  }

  exportAllProperties(): void {
    this.exportService.exportProperties(this.tenant, this.environment).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.tenant}_${this.environment}_properties.sql`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: {
            message: `Exported Successfully !`,
            icon: 'check-circle'
          },
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error("Error exporting properties:", err);
        this.snackBar.openFromComponent(ErrorSnackbarComponent, {
          data: {
            message: `Export Failed`,
            icon: 'check-circle'
          },
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      complete: () => {
      },
    });
  }

  exportSelectedProperties(): void {

    this.exportService.exportSelectedProperties(this.tenant, this.environment, this.selectedIds).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.tenant}_${this.environment}_properties.sql`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: {
            message: `Properties Exported Successfully !`,
            icon: 'check-circle'
          },
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error("Error exporting properties:", err);
        this.snackBar.openFromComponent(ErrorSnackbarComponent, {
          data: {
            message: `Export Failed`,
            icon: 'check-circle'
          },
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      complete: () => {

      },
    });
  }

  deleteSelectedProperties() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.propertyService.deleteMulitpleProperty(this.selectedIds).subscribe({
          next: (response) => {
            console.log(response);
            this.snackBar.openFromComponent(SuccessSnackbarComponent, {
              data: {
                message: `Deleted Successfully !`,
                icon: 'check-circle'
              },
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            this.loadPropertiesForTenants();
            this.selectedIds = []
          },
          error: (err) => {
            console.log(err);
            this.snackBar.openFromComponent(ErrorSnackbarComponent, {
              data: {
                message: `Error Occured in Delete`,
                icon: 'check-circle'
              },
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        })
      }
    });
   
  }

  exportAllData() {
    this.exportService.exportAllDataForSpecific(this.tenant, this.environment).subscribe({
      next: (res) => {
        console.log(res);

        if (res.statusCode == 200 && res.message == 'success') {
          console.log("Hello World!");

          this.exportService.exportingAllSpecificData(this.tenant, this.environment).subscribe({


            next: (blob) => {
              console.log("Hello Wolrd 2");
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${this.tenant}_${this.environment}_properties.sql`;
              a.click();
              window.URL.revokeObjectURL(url);
              this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                data: {
                  message: `Configuration Exported Successfully !`,
                  icon: 'check-circle'
                },
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            },
            error: (err) => {
              console.error("Error exporting properties:", err);
              this.snackBar.openFromComponent(ErrorSnackbarComponent, {
                data: {
                  message: `Export Failed.`,
                  icon: 'check-circle'
                },
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            },
            complete: () => {

            },
          })
        }
        else {
          this.snackBar.openFromComponent(ErrorSnackbarComponent, {
            data: {
              message: `You cannot export because no edit, delete, or add operations have been performed.`,
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


  addProperty() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.minWidth = '800px';
    dialogConfig.minHeight = '400px';
    dialogConfig.maxHeight = '580px';
    dialogConfig.maxWidth = '900px';
    dialogConfig.data = {
      application: this.applications,
      configId: '',
      env: this.environment,
      fieldGroup: this.fieldGroups,
      id: null,
      isEdit: '',
      label: '',
      profile: '',
      propKey: '',
      propertyType: '',
      secret: '',
      tenant: this.tenant,
      tenantEnvId: '',
      value: '',
      lastUpdatedBy: ''



      // target: this.targets,
      // type: this.types,
      // release: this.release
    };

    const dialogRef = this.dialog.open(AddPropertyDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result) {
        const payload = {
          env: this.environment,
          tenant: this.tenant,
          propKey: result.propKey.trim(),
          value: result.value.trim(),
          application: result.application,
          fieldGroup: result.fieldGroup,
          profile: this.environment,
          lastUpdatedBy: result.propertyType,
          secret: null,
          target: result.target,
          label: result.label
        };
        this.propertyService.addProperty(payload).subscribe({
          next: (response) => {
            console.log(response);
            if (response.statusCode === 200) {
              console.log("Property added successfully");
              this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                data: {
                  message: `Configuration added Successfully !`,
                  icon: 'check-circle'
                },
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              this.loadPropertiesForTenants();
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
    });
  }

  editProperty(property: any) {
    console.log(property);

    const dialogConfig = new MatDialogConfig();


    dialogConfig.minWidth = '800px'; // Customize the width of the dialog
    dialogConfig.minHeight = '400px';
    dialogConfig.maxHeight = '580px';
    dialogConfig.maxWidth = '900px';
    dialogConfig.data = {
      // 
      applications: this.applications,
      application: property.application,
      configId: property.configId,
      env: this.environment,
      fieldGroup: property.fieldGroup,
      fieldGroups: this.fieldGroups,
      id: property.id,
      isEdit: property.isEdit,
      label: property.label,
      profile: property.profile,
      propKey: property.propKey,
      propertyType: property.propertyType,
      secret: property.secret,
      tenant: this.tenant,
      tenantEnvId: property.tenantEnvId,
      value: property.value,
      lastUpdatedBy: property.lastUpdatedBy,
    };

    const dialogRef = this.dialog.open(PropertyDialogComponent, dialogConfig);


    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        const payload = {
          id: property.id,
          isEdit: true,
          isAdd:property.isAdd,
          isDelete:property.isDelete,
          configId: property.configId,
          env: this.environment,
          tenant: this.tenant,
          propKey: result.propKey.trim(),
          value: result.value.trim(),
          application: result.application,
          fieldGroup: result.fieldGroup,
          profile: this.environment,
          propertyType: result.propertyType,
          secret: property.secret,
          label: result.label,
          tenantEnvId: property.tenantEnvId,
          lastUpdatedBy: result.lastUpdatedBy,

        };
        this.propertyService.updateProperty(payload).subscribe({
          next: (response) => {
            if (response.statusCode == 201) {
              this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                data: {
                  message: `Configuration Updated Successfully !`,
                  icon: 'check-circle'
                },
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              console.log(response.message);
              console.log('Property updated:');
              this.loadPropertiesForTenants();
              this.clearSearch();
            }
            else {
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
            console.error('Error updating property:', err);
            this.snackBar.openFromComponent(ErrorSnackbarComponent, {
              data: {
                message: `${err}`,
                icon: 'check-circle'
              },
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        })
      }
    });
  }

  deleteProperty(id: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.propertyService.deleteProperty(id).subscribe({
          next: (res) => {
            if (res.statusCode == 200) {
              this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                data: {
                  message: `Configuration Deleted Successfully !`,
                  icon: 'check-circle'
                },
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              console.log(res.message);
              console.log('Property Deleted!');
              this.loadPropertiesForTenants();
              this.clearSearch();
            }
            else {
              this.snackBar.openFromComponent(ErrorSnackbarComponent, {
                data: {
                  message: `${res.message}`,
                  icon: 'check-circle'
                },
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            }

          },
          error: (err) => {
            console.error('Error deleting property:', err);
            this.snackBar.openFromComponent(ErrorSnackbarComponent, {
              data: {
                message: `${err}`,
                icon: 'check-circle'
              },
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        })
      } else {
        console.log('Deletion canceled');
      }
    });
  }
  navigateToProperties() {
    this.addProperty();
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

  handleSelectAll(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.selectAll(inputElement.checked);
    }
  }

  toggleSearchDrawer(): void {
    this.showSearchDrawer = !this.showSearchDrawer;
  }

  toggleSelection(propertyId: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.checked) {
      this.selectedIds.push(propertyId);
    } else {
      const index = this.selectedIds.indexOf(propertyId);
      if (index > -1) {
        this.selectedIds.splice(index, 1);
      }
    }
    console.log(this.selectedIds);

    this.isAllSelected = this.selectedIds.length === this.properties.length;
  }


  selectAll(checked: boolean): void {
    if (checked) {
      this.selectedIds = this.filteredProperties.map(property => property.id);
    } else {
      this.selectedIds = [];
    }
    this.isAllSelected = checked;
    console.log(this.selectedIds);

  }

  applyAdvancedSearch(): void {
    const { keyword, application, fieldGroup, type, target } = this.advancedSearch;

    this.filteredProperties = this.properties.filter(property => {
      const matchesKeyword =
        keyword ? (property.propKey + property.value).toLowerCase().includes(keyword.toLowerCase()) : true;
      const matchesApplication = application ? property.application === application : true;
      const matchesFieldGroup = fieldGroup ? property.fieldGroup === fieldGroup : true;
      const matchesType = type ? property.type === type : true;
      const matchesTarget = target ? property.target === target : true;

      return matchesKeyword && matchesApplication && matchesFieldGroup && matchesType && matchesTarget;
    });

    this.propertySize = this.filteredProperties.length;

    this.currentPage = 1;
    this.updatePagination();
    this.toggleDrawer();
  }

  resetSearch(): void {
    this.advancedSearch = {
      keyword: '',
      application: '',
      fieldGroup: '',
      type: '',
      target: ''
    };
    this.filterProperties();
    // this.toggleDrawer();
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  applyFilters() {
    console.log('Applied Filters:', this.advancedSearch);
  }

}
