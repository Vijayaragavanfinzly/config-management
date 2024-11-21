import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-environment-details',
  standalone: true,
  imports: [RouterModule,FormsModule,CommonModule],
  templateUrl: './environment-details.component.html',
  styleUrl: './environment-details.component.css'
})
export class EnvironmentDetailsComponent implements OnInit{

  environment: string = '';

  constructor(private route:ActivatedRoute){}

  ngOnInit(): void {
    this.route.queryParams.subscribe((param)=>{
    this.environment = param['env']
    })
  }
}
