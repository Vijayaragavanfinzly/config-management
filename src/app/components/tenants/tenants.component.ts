import { Component, OnInit, signal } from '@angular/core';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { Tenant } from '../../model/tenant.interface';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppComponent } from "../../app.component";
import { SpinnerComponent } from "../spinner/spinner.component";

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [RouterModule, CommonModule, SpinnerComponent],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.css'
})
export class TenantsComponent implements OnInit{

  tenants: Tenant[] = [];
  loading:Boolean = false;

  constructor(private tenantService:TenantService){  }

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading = true;
    this.tenantService.getAllTenants().subscribe({
      next: (data: Tenant[]) => {
        console.log("Fetched tenants successfully:", data);
        this.tenants = data;
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
  

}
