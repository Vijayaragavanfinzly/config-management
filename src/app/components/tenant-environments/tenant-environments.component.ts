import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { AddTenantDialogComponent } from '../miscellaneous/dialogs/add-tenant-dialog/add-tenant-dialog.component';
import { SpinnerComponent } from '../miscellaneous/spinner/spinner.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddEnvironmentDialogComponent } from '../miscellaneous/dialogs/add-environment-dialog/add-environment-dialog.component';


@Component({
  selector: 'app-tenant-environments',
  standalone: true,
  imports: [RouterModule, CommonModule, SpinnerComponent, MatDialogModule, MatButtonModule, FormsModule],
  templateUrl: './tenant-environments.component.html',
  styleUrl: './tenant-environments.component.css'
})
export class TenantEnvironmentsComponent implements OnInit {

  tenant: string = "";
  tenantName: string = '';
  application: string = '';
  fieldGroup: string = '';
  environments: any[] = [];
  filteredEnvironments: any[] = [];
  searchKeyword: string = ""
  loading: boolean = false;

  constructor(private route: ActivatedRoute, private tenantService: TenantService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.tenant = param['tenant'];
      if (this.tenant) {
        this.loadEnvironmentsForTenant();
      } else {
        console.error("No tenant parameter provided in the route.");
      }
    });
  }

  loadEnvironmentsForTenant(): void {
    this.loading = true;
    this.tenantService.getTenantEnvironments(this.tenant).subscribe({
      next: (data: any) => {
        console.log(data);
        this.environments = data.data.environments;
        this.tenantName = data.data.tenantName;
        this.filteredEnvironments = this.environments.filter(env => env !== 'PENDING');

        console.log("Tenant Name : " + this.tenantName);
        console.log("Loaded environments for tenant:", this.environments);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open('Error fetching environments. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['custom-toast', 'toast-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        console.error("Error fetching environments for tenant:", err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  filterEnvironment(): void {
    if (this.searchKeyword.trim()) {
      console.log(this.searchKeyword);
      this.filteredEnvironments = this.environments.filter(environment =>
        environment.toLowerCase().includes(this.searchKeyword.toLowerCase()) && environment !== 'PENDING'
      );
    } else {
      this.filteredEnvironments = this.environments.filter(env => env !== 'PENDING');
    }
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.filterEnvironment();
  }

  addNewEnvironmentForTenant(): void {
    const dialogRef = this.dialog.open(AddEnvironmentDialogComponent, {
      width: '600px',
      data: {
        tenant: this.tenant,
        environment: '',
        tenant_name: this.tenantName,
        release:''
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const payload = {
          environment: result.environment.toLowerCase(),
          tenantName: this.tenantName,
          tenant: this.tenant,
          release:result.release
        };
        console.log(result);
        console.log(payload);
        this.tenantService.addNewTenantWithEnvironment(payload).subscribe({
          next: (data) => {
            if (data && data.statusCode === 500) {
              this.snackBar.open('Tenant & Environment Already Exists !', 'Close', {
                duration: 3000,
                panelClass: ['custom-toast', 'toast-error'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              console.error("Error Adding Tenant Environment:", data);
            } else {
              console.log("Tenant Environment Added Successfully!", data);
              this.snackBar.open('Environment Added Successfully!', 'Close', {
                duration: 3000,
                panelClass: ['custom-toast', 'toast-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              this.loadEnvironmentsForTenant();
            }
          },
          error: (error) => {
            console.log("Error Adding Tenant Environment", error);
          }
        })
      }
    });
  }
}