import { Component } from '@angular/core';
import { SpinnerComponent } from "../miscellaneous/spinner/spinner.component";

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {

}
