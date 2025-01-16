import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-guide-comparison',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './guide-comparison.component.html',
  styleUrl: './guide-comparison.component.css'
})
export class GuideComparisonComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.executeComparison();
  }

  navigateBack(): void {
    // Navigate back to the comparison page or any other route
    this.router.navigate(['/comparison']);
  }

  tenantsInput = '1stsb, mcb, nbh, banka, finzly';
  propertiesInput = `db.tenant.1stsb.ip
cloud.aws.region.static
bankos.plaid.apiversion
smtp.host
bankos.quicksight.tenants.nbh.aws.region
bankos.tenant.finzly.fee.customFee
bankos.tenant.banka.customer.portal.url
db.tenant.mcb.maximum-pool-size
db.idle-timeout
spring.datasource.username`;

  tenantBasedProperties: string[] = [];
  commonProperties: string[] = [];

  executeComparison(): void {
    const tenants = this.tenantsInput.split(',').map((tenant) => tenant.trim()).filter(Boolean); // Ensure no empty strings
    const properties = this.propertiesInput.split('\n').map((property) => property.trim()).filter(Boolean); // Ensure no empty lines
  
    this.tenantBasedProperties = [];
    this.commonProperties = [];
  
    properties.forEach((property) => {
      if (tenants.length > 0 && tenants.some((tenant) => property.includes(tenant))) {
        this.tenantBasedProperties.push(property);
      } else {
        this.commonProperties.push(property);
      }
    });
  }
  
}
