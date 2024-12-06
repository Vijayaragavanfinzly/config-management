import { Component, OnInit, signal } from '@angular/core';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { Tenant } from '../../model/tenant.interface';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AddTenantDialogComponent } from '../miscellaneous/dialogs/add-tenant-dialog/add-tenant-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SpinnerComponent } from '../miscellaneous/spinner/spinner.component';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [RouterModule, CommonModule, SpinnerComponent, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.css'
})
export class TenantsComponent implements OnInit {

  tenants: Tenant[] = [];
  searchKeyword: string = '';
  filteredTenants: Tenant[] = [];
  loading: Boolean = false;

  constructor(private tenantService: TenantService, private dialog: MatDialog, private router: Router, private snackBar: MatSnackBar

  ) { }

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading = true;
    this.tenantService.getAllTenants().subscribe({
      next: (data: any) => {
        if (data) {
          console.log("Fetched tenants successfully:", data);
          this.tenants = data.data;
          this.filteredTenants = [...this.tenants];
        }
      },
      error: (err) => {
        console.error("Failed to fetch tenants:", err);
      },
      complete: () => {
        this.loading = false;
        console.log("Tenant loading process completed.");
      }
    });
  }

  filterTenants(): void {
    if (this.searchKeyword.trim()) {
      this.filteredTenants = this.tenants.filter(
        tenant =>
          tenant.tenantName.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          tenant.tenant.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    } else {
      this.filteredTenants = [...this.tenants]
    }
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.loadTenants();
  }


  addNewTenant(): void {
    const dialogRef = this.dialog.open(AddTenantDialogComponent, {
      width: '400px',
      data: {
        tenant: '',
        environment: '',
        tenant_name: ''
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const payload = {
          environment: result.environment.toUpperCase(),
          tenantName: result.tenant_name,
          tenant: result.tenant.toUpperCase(),
        };
        this.tenantService.addNewTenantWithEnvironment(payload).subscribe({
          next: (data: any) => {
            if (data && data.statusCode === 201) {
              console.log("Tenant Environment added successfully!");
              this.snackBar.open('Tenant & Environment Added Successfully!', 'Close', {
                duration: 3000,
                panelClass: ['custom-toast','toast-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              console.log(data.message);
              this.loadTenants();
            } else {
              this.snackBar.open('Tenant & Environment Already Exists !', 'Close', {
                duration: 3000,
                panelClass: ['custom-toast','toast-error'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              console.error("Failed to add Tenant Environment:", data?.message || "Unknown error");
            }
          },
          error: (error) => {
            console.error("Error while adding Tenant Environment:", error);
          }
        })
      }
    });
  }
}