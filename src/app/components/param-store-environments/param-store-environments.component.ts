import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ParamStoreServiceService } from '../../services/param-store-service/param-store-service.service';

@Component({
  selector: 'app-param-store-environments',
  standalone: true,
  imports: [RouterModule, CommonModule, MatDialogModule, MatButtonModule, FormsModule,MatTooltipModule],
  templateUrl: './param-store-environments.component.html',
  styleUrl: './param-store-environments.component.css'
})
export class ParamStoreEnvironmentsComponent implements OnInit{
tenant: string = "";
  tenantName: string = '';
  application: string = '';
  fieldGroup: string = '';
  environments: any[] = [];
  filteredEnvironments: any[] = [];
  searchKeyword: string = ""
  loading: boolean = false;

  constructor(private route: ActivatedRoute, private tenantService: TenantService, private dialog: MatDialog, private snackBar: MatSnackBar, private paramService:ParamStoreServiceService) { }
  
  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.tenant = param['tenant'];
      if (this.tenant) {
        console.log(this.tenant);
        this.loadEnvironmentsForTenant();
      } else {
        console.error("No tenant parameter provided in the route.");
      }
    });
  }

  loadEnvironmentsForTenant(): void {
    this.loading = true;
    this.paramService.getEnvironmentsForTenant(this.tenant).subscribe({
      next: (data: any) => {
        console.log(data);
        this.environments = data.data;
        this.filteredEnvironments = [...this.environments];

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
}
