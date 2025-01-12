import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-compare-dialog',
  standalone: true,
  imports: [CommonModule,MatTooltipModule,MatIconModule],
  templateUrl: './compare-dialog.component.html',
  styleUrl: './compare-dialog.component.css'
})
export class CompareDialogComponent implements OnInit {


  comparisonData : any;

  constructor(
    private dialogRef: MatDialogRef<CompareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.comparisonData = data.comparison;
  }


  ngOnInit(): void {
    console.log(this.comparisonData);
    
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  get isMatch(): boolean {
    return this.comparisonData.value_env1 === this.comparisonData.value_env2;
  }

  truncate(value: string, limit: number = 70): string {
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }

}
