import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EnvironmentService } from '../../services/environment-service/environment.service';
import { Environment } from '../../model/environment.interface';
import { SpinnerComponent } from "../miscellaneous/spinner/spinner.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AddTenantDialogComponent } from '../miscellaneous/dialogs/add-tenant-dialog/add-tenant-dialog.component';

@Component({
  selector: 'app-environments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SpinnerComponent,MatDialogModule,MatButtonModule],
  templateUrl: './environments.component.html',
  styleUrl: './environments.component.css'
})
export class EnvironmentsComponent implements OnInit {

  environments: Environment[] = [];

  searchKeyword: string = '';

  loading: boolean = false;

  constructor(private route: ActivatedRoute, private environmentService: EnvironmentService) {

  }

  ngOnInit(): void {
    this.loadAllEnvironments();
  }

  loadAllEnvironments(): void {
    this.loading = true;
    this.environmentService.getAllEnvironments().subscribe({
      next: (data: any) => {
        this.environments = data.data;
        console.log("Fetched environments successfully:", this.environments);
      },
      error: (err) => {
        console.error("Error fetching environments:", err);
      },
      complete: () => {
        this.loading = false;
        console.log("Environment loading process completed.");
      }
    });
  }

  
  
  
}
