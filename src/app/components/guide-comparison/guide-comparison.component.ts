import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guide-comparison',
  standalone: true,
  imports: [],
  templateUrl: './guide-comparison.component.html',
  styleUrl: './guide-comparison.component.css'
})
export class GuideComparisonComponent {
  constructor(private router: Router) {}

  navigateBack(): void {
    // Navigate back to the comparison page or any other route
    this.router.navigate(['/comparison']);
  }
}
