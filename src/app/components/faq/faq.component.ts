import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent implements OnInit{
  activeFaqId: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.activeFaqId = params['faqId'] || null;
      if (this.activeFaqId) {
        this.scrollToFaq(this.activeFaqId);
      }
    });
  }

  scrollToFaq(faqId: string) {
    const element = document.getElementById(faqId);
    if (element) {
      element.classList.add('show');
      element.scrollIntoView({ behavior: 'smooth' }); // Scroll to the accordion
    }
  }


  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
}
