import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SpinnerComponent } from "../spinner/spinner.component";
import { CommonModule } from '@angular/common';
import { TenantService } from '../../services/tenant-service/tenant.service';
import { Property } from '../../model/property.interface';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PropertyDialogComponent } from '../property-dialog/property-dialog.component';
import { PropertyService } from '../../services/property-service/property.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-tenant-environment-properties',
  standalone: true,
  imports: [RouterModule, SpinnerComponent,CommonModule,MatDialogModule,MatButtonModule],
  templateUrl: './tenant-environment-properties.component.html',
  styleUrl: './tenant-environment-properties.component.css'
})
export class TenantEnvironmentPropertiesComponent implements OnInit {

  tenant:string = '';
  environment:string = '';
  properties: Property[] = [];
  loading:Boolean = false;

  constructor(private route:ActivatedRoute,private tenantService:TenantService,
            private dialog: MatDialog,private propertyService:PropertyService
  ){}

  ngOnInit(): void {
    this.route.params.subscribe((param)=>{
      this.environment = param['environment']
      this.tenant = param['tenant']
      if(this.environment && this.tenant){
        this.loadPropertiesForTenants();
      }
    })
  }

  loadPropertiesForTenants(){
    this.loading = true;
    this.tenantService.getTenantProperties(this.tenant,this.environment).subscribe({
      next: (data: Property[]) => {
        this.properties = data;
        console.log("Loaded properties for " + this.tenant + " " + this.environment, this.properties);
      },
      error:(err)=>{
        console.error("Error fetching properties for tenant:", err);
      },
      complete:()=>{
        this.loading = false
      }
    })
  }

  editProperty(property: Property) {
    const dialogRef = this.dialog.open(PropertyDialogComponent, {
      width: '400px',
      data: property
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.propertyService.updateProperty(result).subscribe({
          next:()=>{
            console.log('Property updated:');
            this.loadPropertiesForTenants();
          },
          error:(err)=>{
            console.error('Error updating property:', err);
          }
        })
      }
    });
  }
  
  deleteProperty(id: number) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent,{
        width:'400px',
      });
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.propertyService.deleteProperty(id).subscribe({
            next:()=>{
              console.log('Property Deleted!');
              this.loadPropertiesForTenants();
            },
            error:(err)=>{
              console.error('Error deleting property:', err);
            }
          })
        } else {
          console.log('Deletion canceled');
        }
      });
  }
  navigateToProperties(){

  }

}
