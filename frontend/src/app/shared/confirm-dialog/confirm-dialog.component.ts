import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {

  @Input() message: string = 'Are you sure?';
  @Output() confirmed = new EventEmitter<boolean>();

  onConfirm() { this.confirmed.emit(true); }
  onCancel() { this.confirmed.emit(false); }

}
