import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { Environment } from '../../model/environment.interface';
import { SpinnerComponent } from "../spinner/spinner.component";

@Component({
  selector: 'app-tenant-environments',
  standalone: true,
  imports: [RouterModule, CommonModule, SpinnerComponent],
  templateUrl: './tenant-environments.component.html',
  styleUrl: './tenant-environments.component.css'
})
export class TenantEnvironmentsComponent implements OnInit{

  tenant : string = "";
  environments: Environment[] = [];
  loading: Boolean = false;

  constructor(private route:ActivatedRoute,private tenantService:TenantService){}

  ngOnInit(): void {
    this.route.params.subscribe((param)=>{
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
      next: (data: Environment[]) => {
        this.environments = data;
        console.log("Loaded environments for tenant:", this.environments);
      },
      error: (err) => {
        console.error("Error fetching environments for tenant:", err);
      },
      complete:()=>{
        this.loading = false;
      }
    });
  }

}
