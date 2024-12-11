import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { distinctUntilChanged, fromEvent, Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[columnResize]',
  standalone: true
})
export class ColumnResizeDirective implements OnInit, OnDestroy {
  private startX!: number;
  private isResizing = false;
  private initialWidth!: number;
  private columnIndex!: number;
  private table: HTMLElement | null = null;
  private onDestroy$ = new Subject<void>();

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const nativeElement = this.elementRef.nativeElement as HTMLElement;
    const mousedown = fromEvent<MouseEvent>(nativeElement, 'mousedown');

    mousedown.pipe(takeUntil(this.onDestroy$), distinctUntilChanged())
      .subscribe(event => this.onMouseDown(event));
      
    // Prevent click event while resizing
    fromEvent<MouseEvent>(nativeElement, 'click').pipe(takeUntil(this.onDestroy$), distinctUntilChanged())
      .subscribe(event => event.stopPropagation());
  }

  private onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.startX = event.pageX;
    this.isResizing = true;
    this.initialWidth = this.elementRef.nativeElement.offsetWidth;

    const row = this.elementRef.nativeElement.parentElement;
    const cells = Array.from(row.children);
    this.columnIndex = cells.indexOf(this.elementRef.nativeElement);

    this.table = this.findParentTable(this.elementRef.nativeElement);

    if (this.table) {
      this.renderer.addClass(this.table, 'table-resizing');
      const columns = this.table.querySelectorAll('th');

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (this.isResizing) {
          const deltaX = moveEvent.pageX - this.startX;
          const newWidth = this.initialWidth + deltaX;

          if (newWidth >= 40 && newWidth <= 350) {
            // Ensure that this.table is not null before accessing it
            if (this.table) {
              this.renderer.setStyle(this.elementRef.nativeElement, 'width', `${newWidth}px`);
          
              // Ensure that columns are defined and not null before accessing them
              const columns = Array.from(this.table.querySelectorAll('th'));
              if (columns[this.columnIndex]) {
                columns[this.columnIndex].style.width = `${newWidth}px`;
              }
          
              const rows = this.table.querySelectorAll('tr');
              rows.forEach((row) => {
                const cells = row.querySelectorAll('td');
                if (cells[this.columnIndex]) {
                  cells[this.columnIndex].style.maxWidth = `${newWidth}px`;
                }
              });
            }
          }
          
        }
      };

      const onMouseUp = () => {
        this.isResizing = false;
        this.renderer.removeClass(this.table, 'table-resizing');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  }

  private findParentTable(element: HTMLElement): HTMLElement | null {
    while (element) {
      if (element.tagName === 'TABLE') {
        return element;
      }
      if (element.parentElement) {
        element = element.parentElement;
      }
    }
    return null;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
