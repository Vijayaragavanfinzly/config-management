import { ChangeDetectionStrategy, Component, OnInit, Renderer2, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css'],
})
export class CompareComponent{

  
}