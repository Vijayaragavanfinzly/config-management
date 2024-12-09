import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TenantService } from '../../services/tenant-service/tenant.service';
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

@Component({
  selector: 'app-tenant-environment-properties',
  standalone: true,
  imports: [RouterModule, SpinnerComponent, CommonModule, MatDialogModule, MatButtonModule, FormsModule],
  templateUrl: './tenant-environment-properties.component.html',
  styleUrl: './tenant-environment-properties.component.css'
})
export class TenantEnvironmentPropertiesComponent implements OnInit {

  tenant: string = '';
  environment: string = '';
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  paginatedProperties: Property[] = [];
  searchKeyword: string = '';
  loading: Boolean = false;

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  pages: number[] = []

  constructor(private route: ActivatedRoute,
    private dialog: MatDialog, private propertyService: PropertyService, private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.environment = param['environment']
      this.tenant = param['tenant']
      if (this.environment && this.tenant) {
        this.loadPropertiesForTenants();
      }
    })
  }

  loadPropertiesForTenants() {
    this.loading = true;
    this.propertyService.getTenantProperties(this.tenant, this.environment).subscribe({
      next: (data: any) => {
        this.properties = data.data;
        this.filteredProperties = [...this.properties];
        this.currentPage = 1;
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

  filterProperties() {
    if (this.searchKeyword.trim()) {
      this.filteredProperties = this.properties.filter(
        property =>
          property.propertyKey.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          property.propertyValue.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    } else {
      this.filteredProperties = [...this.properties];
    }
    this.currentPage = 1;
    this.updatePagination();
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
  }


  addProperty() {
    const dialogRef = this.dialog.open(AddPropertyDialogComponent, {
      width: '400px',
      data: {
        tenant: this.tenant,
        environment: this.environment,
        propertyKey: '',
        propertyValue: '',
        id: null,
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const payload = {
          environment: this.environment,
          tenant: this.tenant,
          propertyKey: result.propertyKey.trim(),
          propertyValue: result.propertyValue.trim()
        };
        this.propertyService.addProperty(payload).subscribe({
          next: (response) => {
            console.log(response);
            if (response.statusCode === 200) {
              console.log("Property added successfully");
              this.snackBar.open('Configuration added Successfully!', 'Close', {
                duration: 3000,
                panelClass: ['custom-toast', 'toast-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              this.loadPropertiesForTenants();
            }
            else {
              this.snackBar.open(response.message, 'Close', {
                duration: 3000,
                panelClass: ['custom-toast', 'toast-error'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            }

          },
          error: (err) => {
            console.log(err);
            this.snackBar.open('Failed to create the configuration. Please try again.', 'Close', {
              duration: 3000,
              panelClass: ['custom-toast', 'toast-error'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            console.error('Error adding property:', err);
          }
        })
      }
    });
  }

  editProperty(property: Property) {
    const dialogRef = this.dialog.open(PropertyDialogComponent, {
      width: '400px',
      data: {
        propertyKey: property.propertyKey,
        propertyValue: property.propertyValue,
        id: property.id,
        tenant: this.tenant,
        environment: this.environment
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.propertyService.updateProperty(result).subscribe({
          next: (response) => {
            if (response.statusCode == 201) {
              this.snackBar.open('Configuration updated Successfully!', 'Close', {
                duration: 3000,
                panelClass: ['custom-toast', 'toast-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              console.log(response.message);
              console.log('Property updated:');
              this.loadPropertiesForTenants();
            }
            else {
              this.snackBar.open(response.message, 'Close', {
                duration: 3000,
                panelClass: ['custom-toast', 'toast-error'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            }
          },
          error: (err) => {
            console.error('Error updating property:', err);
          }
        })
      }
    });
  }

  deleteProperty(id: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.propertyService.deleteProperty(id).subscribe({
          next: (res) => {
            if (res.statusCode == 200) {
              this.snackBar.open('Configuration deleted Successfully!', 'Close', {
                duration: 3000,
                panelClass: ['custom-toast', 'toast-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              console.log(res.message);
              console.log('Property Deleted!');
              this.loadPropertiesForTenants();
            }
            else{
              this.snackBar.open(res.message, 'Close', {
                duration: 3000,
                panelClass: ['custom-toast', 'toast-error'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            }

          },
          error: (err) => {
            console.error('Error deleting property:', err);
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

}
