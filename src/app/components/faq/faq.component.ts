import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {
  // faqs = [
  //     {
  //       question: 'What is devops_input?',
  //       answer: `The <mark>devops_input</mark> field is used to capture inputs provided by the DevOps team for specific configurations or automation workflows.`,
  //       expanded: false
  //     },
  //     {
  //       question: 'What is missing_key?',
  //       answer: 'The <mark>`missing_key`</mark> refers to a situation where a particular property or key is not available for a specific tenant. It indicates that the system is unable to locate a required key for a given tenant.',
  //       expanded: false
  //     },
  //     {
  //       question: 'What is ops_input?',
  //       answer: 'The <mark>`ops_input`</mark> field stores inputs provided by the Operations team, which are required for executing operational tasks or scripts.',
  //       expanded: false
  //     },
  // ];
  constructor(private router: Router) {}


  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
}
