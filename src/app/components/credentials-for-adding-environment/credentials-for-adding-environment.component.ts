import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from '../miscellaneous/spinner/spinner.component';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CredentialsAddNewComponent } from '../miscellaneous/dialogs/credentials-add-new/credentials-add-new.component';
import { CredentialServiceService } from '../../services/credential-service/credential-service.service';
import { SuccessSnackbarComponent } from '../miscellaneous/snackbar/success-snackbar/success-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CredentialsEditComponent } from '../miscellaneous/dialogs/credentials-edit/credentials-edit.component';

@Component({
  selector: 'app-credentials-for-adding-environment',
  standalone: true,
  imports: [RouterModule, CommonModule, SpinnerComponent, FormsModule, MatDialogModule, MatButtonModule, MatTooltipModule],
  templateUrl: './credentials-for-adding-environment.component.html',
  styleUrl: './credentials-for-adding-environment.component.css'
})
export class CredentialsForAddingEnvironmentComponent implements OnInit {


  loading: boolean = false;
  allCredentials: any;
  isLoading: boolean = false;


  constructor(private dialog: MatDialog, private credentialService: CredentialServiceService, private snackBar: MatSnackBar) {

  }


  ngOnInit(): void {
    this.getAllCredentials();
  }

  getAllCredentials():void{
    this.credentialService.getAllCredentials().subscribe({
      next:(response)=>{
        console.log(response);
        this.allCredentials = response.data;
        console.log(this.allCredentials);
      },
      error:(err)=>{
        console.log(err);
      }
    })
  }

  openAddDialog(): void {
    const dialogConfig = new MatDialogConfig();

    // Set custom dialog properties
    dialogConfig.minWidth = '500px'; // Customize the width of the dialog
    dialogConfig.minHeight = '400px';
    dialogConfig.maxHeight = '580px';
    dialogConfig.maxWidth = '900px';
    dialogConfig.data = {
      environment: '',
      username: '',
      password: '',
      url: '',
    };

    const dialogRef = this.dialog.open(CredentialsAddNewComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result) {
        const payload = {
          env: result.environment,
          username: result.username,
          password: result.password,
          url: result.url,
        };
        console.log(payload);

        this.credentialService.StoreCredential(payload).subscribe({
          next: (respone) => {
            console.log(respone);
            if(respone.statusCode === 200){
              this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                data: {
                  message: `Credential Added Successfully !`,
                  icon: 'check-circle'
                },
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              this.getAllCredentials();
            }
          }
        })
      }
    });
  }

  openEditDialog(data:any):void{
    console.log(data);

    const dialogConfig = new MatDialogConfig();

    // Set custom dialog properties
    dialogConfig.minWidth = '500px'; // Customize the width of the dialog
    dialogConfig.minHeight = '400px';
    dialogConfig.maxHeight = '580px';
    dialogConfig.maxWidth = '900px';
    dialogConfig.data = {
      environment: data.env,
      username: data.username,
      password: data.password,
      url: data.url,
    };

    console.log(dialogConfig.data);
    

    const dialogRef = this.dialog.open(CredentialsEditComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result) {
        const payload = {
          id:data.id,
          env: result.environment,
          username: result.username,
          password: result.password,
          url: result.url,
        };
        console.log(payload);

        this.credentialService.StoreCredential(payload).subscribe({
          next: (respone) => {
            console.log(respone);
            if(respone.statusCode === 200){
              this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                data: {
                  message: `Credential Added Successfully !`,
                  icon: 'check-circle'
                },
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              this.getAllCredentials();
            }
          }
        })
      }
    });

    
  }


  maskPassword(password: string): string {
    return '*'.repeat(password.length);
  }
}
