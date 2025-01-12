import { Component, OnInit, Renderer2 } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CompareService } from '../../services/compare-service/compare.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CompareDialogComponent } from '../miscellaneous/dialogs/compare-dialog/compare-dialog.component';
import { SpinnerComponent } from "../miscellaneous/spinner/spinner.component";

@Component({
  selector: 'app-compare-live-config',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule, MatButtonModule, RouterModule, SpinnerComponent],
  templateUrl: './compare-live-config.component.html',
  styleUrl: './compare-live-config.component.css'
})
export class CompareLiveConfigComponent implements OnInit {
  environments: string[] = ['DEV', 'DEV2', 'TEST', 'TEST2'];
  selectedEnv1!: string;
  selectedEnv2!: string;
  comparisonResult: any;
  comparisonKeys: string[] = [];
  comparisonKey1: any = [];
  comparisonKey2: any = [];

  lengthOfKey1: number = 0;
  lengthOfKey2: number = 0;


  selectedKey1: string | null = null;
  selectedKey2: string | null = null;
  selectedComparisonStatus: string | null = null;
  selectedComparisonDetails: string | null = null;

  loading:boolean = false;

  constructor(private compareService: CompareService, private snackBar: MatSnackBar,private dialog:MatDialog) { }

  ngOnInit(): void { }

  onCompare(): void {
    if (!this.selectedEnv1 || !this.selectedEnv2) {
      this.snackBar.open('Both environments must be selected!', 'Close', { duration: 3000 });
      return;
    }

    if (this.selectedEnv1 === this.selectedEnv2) {
      this.snackBar.open('Please select two different environments!', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.compareService.liveComparison(this.selectedEnv1, this.selectedEnv2).subscribe({
      next: (result) => {
        this.comparisonResult = result;
        this.comparisonKeys = Object.keys(result);

        this.comparisonKey1 = [];
        this.comparisonKey2 = [];

        this.comparisonKeys.forEach(key => {
          const item = result[key];
          const status = item.status;

          if (status === "MISSING_IN_ENV2") {
            this.comparisonKey1.push(key);
            this.comparisonKey2.push(null);
            this.lengthOfKey1++;
          } else if (status === "MISSING_IN_ENV1") {
            this.comparisonKey1.push(null);
            this.comparisonKey2.push(key);
            this.lengthOfKey2++;
          } else if (status === "DIFFERENT") {
            const valueEnv1 = item?.prop_key;
            const valueEnv2 = item?.env2_data?.prop_key;

            this.comparisonKey1.push(valueEnv1);
            this.comparisonKey2.push(valueEnv2);
            this.lengthOfKey1++;
            this.lengthOfKey2++;
          } else {
            const valueEnv1 = item?.prop_key;
            const valueEnv2 = item?.env2_data?.prop_key;

            this.comparisonKey1.push(valueEnv1);
            this.comparisonKey2.push(valueEnv2);
            this.lengthOfKey1++;
            this.lengthOfKey2++;
          }
        });
        console.log(this.comparisonResult);
        
        
        
      },
      error:(err)=>{
        console.error(err);
      this.snackBar.open('An error occurred during comparison!', 'Close', { duration: 3000 });
      },
      complete:()=>{
        this.loading = false;
      }
    });
  }

  formatComparison(key: string): string {
    const data = this.comparisonResult[key];
    if (!data) return key;

    const status = data.status;
    if (status === 'MATCH') {
      return `<b>${key}</b>`;
    }

    if (status === 'DIFFERENT') {
      const valueEnv1 = data.value_env1 || '';
      const valueEnv2 = data.value_env2 || '';
      return `<b>${key}</b>: <span style="color: red;">${this.highlightDifferences(valueEnv1, valueEnv2)}</span>`;
    }

    return `<b>${key}</b> (Status: ${status})`;
  }

  copyKeys(keys: string[]): void {
    // Filter out null, undefined, and empty values
    const validKeys = keys.filter(key => key && key.trim());
    
    if (validKeys.length === 0) {
      alert('No valid keys to copy!');
      return;
    }
    
    const dataToCopy = validKeys.join('\n');
    
    navigator.clipboard
      .writeText(dataToCopy)
      .then(() => {
        alert('Keys copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy keys: ', err);
      });
  }
  

  private highlightDifferences(env1: string, env2: string): string {
    const env1Parts = env1.split(' ');
    const env2Parts = env2.split(' ');

    return env1Parts
      .map((word, index) =>
        word !== env2Parts[index]
          ? `<span style="color: red;">${word}</span>`
          : `<span>${word}</span>`
      )
      .join(' ');
  }
  onEnvChange(): void {
    if (this.selectedEnv1 === this.selectedEnv2) {
      console.error('Both environments cannot be the same.');
      alert('Please select two different environments for comparison.');
    } else {
      console.log(`Environment 1: ${this.selectedEnv1}, Environment 2: ${this.selectedEnv2}`);
    }
  }

  openComparisonDialog(key1: string | null, key2: string | null): void {
    const dialogConfig = new MatDialogConfig();


    this.selectedKey1 = key1;
    this.selectedKey2 = key2;

    const comparison = this.comparisonResult[key1 || key2 || ''];
    this.selectedComparisonStatus = comparison?.status || 'Unknown';
    
    
        dialogConfig.minWidth = '800px';
        dialogConfig.minHeight = '400px';
        dialogConfig.maxHeight = '580px';
        dialogConfig.maxWidth = '900px';
        dialogConfig.data = {
          comparison
        };
    
        const dialogRef = this.dialog.open(CompareDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result)=>{
          console.log(result);
        })
  }
}
