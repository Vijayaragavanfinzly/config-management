import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EnvironmentService } from '../../services/environment-service/environment.service';
import { Environment } from '../../model/environment.interface';
import { SpinnerComponent } from "../spinner/spinner.component";

@Component({
  selector: 'app-environments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SpinnerComponent],
  templateUrl: './environments.component.html',
  styleUrl: './environments.component.css'
})
export class EnvironmentsComponent implements OnInit {

  environments: Environment[] = [];

  loading: boolean = false;

  constructor(private route: ActivatedRoute, private environmentService: EnvironmentService) {

  }

  ngOnInit(): void {
    this.loadAllEnvironments();
  }

  loadAllEnvironments(): void {
    this.loading = true;
    this.environmentService.getAllEnvironments().subscribe({
      next: (data: Environment[]) => {
        this.environments = data;
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
