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
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [RouterModule, CommonModule, SpinnerComponent, FormsModule, MatDialogModule, MatButtonModule,MatTooltipModule],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.css'
})
export class TenantsComponent implements OnInit {

  tenants: any[] = [];
  searchKeyword: string = '';
  searchKeywordForEnv: string = '';
  filteredTenants: any[] = [];
  loading: Boolean = false;
  applications: string[] = [];
  activeTab:string = 'tenants';
  environmentsForCommon: string[] = [];
  filteredEnvironmentsForCommon: string[] = [];

  constructor(private tenantService: TenantService, private dialog: MatDialog, private router: Router, private snackBar: MatSnackBar
    ,private applicationService:ApplicationService
  ) { }

  ngOnInit(): void {
    this.loadTenants();
    this.loadApplications();
    this.activeTab = localStorage.getItem('activeTab') || 'tenants';
    if (this.activeTab === 'common') {
      this.loadEnvironmentsForCommon();
    }
  }

  loadTenants(): void {
    this.loading = true;
    this.tenantService.getAllTenants().subscribe({
      next: (data: any) => {
        if (data) {
          console.log("Fetched tenants successfully:", data);
          this.tenants = data.data.sort((a: any, b: any) => {
            return a.localeCompare(b);
          });
          this.filteredTenants = [...this.tenants];
          console.log(this.filteredTenants);
          
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

  loadEnvironmentsForCommon(): void {
    this.loading = true;
    this.tenantService.getTenantEnvironments('common').subscribe({
      next: (data: any) => {
        console.log(data);
        this.environmentsForCommon = data.data.sort((a: any, b: any) => {
          return a.localeCompare(b);
        });
        console.log(this.environmentsForCommon);
        this.filteredEnvironmentsForCommon = [...this.environmentsForCommon];
        
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

  filterTenants(): void {
    if (this.searchKeyword.trim()) {
      this.filteredTenants = this.tenants.filter(
        tenant =>
          tenant.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    } else {
      this.filteredTenants = [...this.tenants]
    }
  }

  filterEnvironments():void{
    if(this.searchKeywordForEnv.trim()){
      this.filteredEnvironmentsForCommon = this.environmentsForCommon.filter(
        env =>
          env.toLowerCase().includes(this.searchKeywordForEnv.toLowerCase())
      )
    }
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.searchKeywordForEnv = '';
    this.loadTenants();
    this.loadEnvironmentsForCommon();
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

  setActiveTab(tab: string) {
    this.clearSearch();
    this.activeTab = tab;
    localStorage.setItem('activeTab', tab);
    if (this.activeTab === 'common') {
      this.loadEnvironmentsForCommon();
    }
  }
  
  
}