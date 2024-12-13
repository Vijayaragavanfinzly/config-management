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
import { ApplicationService } from '../../services/application-service/application.service';


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
  applications: string[] = [];

  constructor(private tenantService: TenantService, private dialog: MatDialog, private router: Router, private snackBar: MatSnackBar
    ,private applicationService:ApplicationService
  ) { }

  ngOnInit(): void {
    this.loadTenants();
    this.loadApplications();
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

  loadApplications():void{
    this.applicationService.getAllApplications().subscribe({
      next:(data:any)=>{
        console.log(data);
        
        if(data.statusCode == '200'){
          this.applications = data.data;
          console.log(this.applications);
        }
      },
      error:(err)=>{
        console.error("Failed to fetch applications:", err);
      },
      complete:()=>{
        console.log("Application loading process completed.");
      }
    })
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
      width: '700px',
      data: {
        tenant: '',
        tenant_name: '',
      }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
  
        const payload = {
          environment: 'PENDING',
          tenantName: result.tenant_name,
          tenant: result.tenant.toLowerCase(),
        };
  
        this.tenantService.addNewTenant(payload).subscribe({
          next: (data: any) => {
            
            if (data && data.statusCode === 201) {
              console.log("Tenant Environment added successfully!");
              this.snackBar.open('Tenant & Environment Added Successfully!', 'Close', {
                duration: 3000,
                panelClass: ['custom-toast', 'toast-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              this.loadTenants();  
            } else {
              this.snackBar.open(data.message, 'Close', {
                duration: 3000,
                panelClass: ['custom-toast', 'toast-error'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              
            }
          },
          error: (error) => {
            console.error("Error while adding Tenant Environment:", error);
            this.snackBar.open('Failed to Add Tenant & Environment!', 'Close', {
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
  
}