import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-guide-sync',
  standalone: true,
  imports: [RouterModule,FormsModule,CommonModule],
  templateUrl: './guide-sync.component.html',
  styleUrl: './guide-sync.component.css'
})
export class GuideSyncComponent {

}
