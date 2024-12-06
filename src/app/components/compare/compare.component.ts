import { Component, OnInit } from '@angular/core';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CompareService } from '../../services/compare-service/compare.service';
import { SpinnerComponent } from "../miscellaneous/spinner/spinner.component";
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ComparePropertyDialogComponent } from '../miscellaneous/dialogs/compare-property-dialog/compare-property-dialog.component';
import { PropertyService } from '../../services/property-service/property.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { UpdateComparePropertyDialogComponent } from '../miscellaneous/dialogs/update-compare-property-dialog/update-compare-property-dialog.component';
import { ConfirmCopyPropertyDialogComponent } from '../miscellaneous/dialogs/confirm-copy-property-dialog/confirm-copy-property-dialog.component';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MatTabsModule, DragDropModule],
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css'],
})
export class CompareComponent implements OnInit {
  tenants: any[] = [];
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

  activeTab: number = 0;
  searchQuery: string = '';
  showSearchBar: boolean = false;


  constructor(private tenantService: TenantService, private compareService: CompareService, private dialog: MatDialog, private propertyService: PropertyService, private snackBar: MatSnackBar) { }

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
    const selectedTenant = tenantKey === 'tenant1' ? this.selectedTenant1 : this.selectedTenant2;

    this.tenantService.getTenantEnvironments(selectedTenant).subscribe({
      next: (data) => {
        const environments = data.data.environments;
        if (tenantKey === 'tenant1') {
          this.tenant1Environments = environments;
        } else {
          this.tenant2Environments = environments;
        }
        this.loading = false;
      },
      error: (err) => console.error(`Error fetching environments for ${tenantKey}:`, err),
    });
  }

  compareEnvironments(): void {
    if (this.selectedTenant1 && this.selectedTenant2 && this.selectedEnv1 && this.selectedEnv2) {
      console.log('Comparing environments:', this.selectedEnv1, this.selectedEnv2);
      this.compareService.compareTenants(this.selectedTenant1, this.selectedEnv1, this.selectedTenant2, this.selectedEnv2).subscribe({
        next: (data) => {
          console.log('Comparison result:', data);
          this.comparisonData = data.data;
          this.filteredSameData = this.comparisonData.filter(entry => entry.isSame === true);
          this.filteredDifferentData = this.comparisonData.filter(entry => entry.isSame === false);
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
    this.comparisonData = [];
    this.filteredSameData = [];
    this.filteredDifferentData = []
    this.snackBar.open('Comparison cleared successfully!', 'Close', {
      duration: 3000,
      panelClass: ['custom-toast', 'toast-success'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  openDialog(entry: any): void {
    console.log(entry);

    const dialogRef = this.dialog.open(ComparePropertyDialogComponent, {
      data: {
        source: entry.PropertyValue1,
        destination: entry.PropertyValue2,
        tenant1: this.selectedTenant1,
        environment1: this.selectedEnv1,
        tenant2: this.selectedTenant2,
        environment2: this.selectedEnv2
      },
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'sourceToDest') {
        this.updateDatabase(entry, entry.PropertyValue1, 'sourceToDest');
      } else if (result === 'destToSource') {
        this.updateDatabase(entry, entry.PropertyValue2, 'destToSource');
      }
    });
  }

  updateDatabase(entry: any, newValue: string, direction: string): void {
    const tenant = direction === 'sourceToDest' ? this.selectedTenant2 : this.selectedTenant1;
    const environment = direction === 'sourceToDest' ? this.selectedEnv2 : this.selectedEnv1;
    if (newValue === null) {
      this.snackBar.open("Can't assign a empty value", 'Close', {
        duration: 3000,
        panelClass: ['custom-toast', 'toast-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    const payload = {
      propertyKey: entry.propertyKey,
      propertyValue: newValue,
      tenant,
      environment,
    };

    this.compareService.editProperty(tenant, environment, entry.propertyKey, newValue).subscribe({
      next: (response) => {
        console.log(response);

        if (direction === 'sourceToDest') {
          entry.PropertyValue2 = newValue;
        } else if (direction === 'destToSource') {
          entry.PropertyValue1 = newValue;
        }
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
        this.compareService.editProperty(targetTenant, targetEnvironment, propertyKey, propertyValue).subscribe({
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
        this.compareService.editProperty(tenant, environment, entry.propertyKey, updatedData.propertyValue).subscribe({
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

}