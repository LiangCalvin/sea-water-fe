import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { PositionGroup } from '../../../../../core/models/calculation/position-group.model';
import { DropdownComponent } from "../../../../../shared/components/dropdown/dropdown.component";
import { NzGridModule } from 'ng-zorro-antd/grid';
import { IdName } from '../../../../../shared/models/id-name.model';
import { CalculationContextService } from '../../../CalculationContext.service';


@Component({
  selector: 'app-position-selector',
  imports: [CommonModule, NzSelectModule, FormsModule, DropdownComponent, NzGridModule],
  templateUrl: './position-selector.component.html',
  styleUrl: './position-selector.component.scss',
  standalone: true,
})
export class PositionSelectorComponent implements OnInit {
  @Output() positionChange = new EventEmitter<PositionGroup>();
  @Input() sequenceFlow: string = '';
  @Output() interacted = new EventEmitter<void>();

  selectedSequenceFlow: string = '';
  study: any;
  transactionId: any;
  private initialized = false;

  constructor(
    private readonly calculationContextService: CalculationContextService
  ) {

  }
  ngOnInit(): void {
    const availableOptions = this.calculationContextService.getAvailableSequenceFlows();
    const match = availableOptions.find(opt => opt === this.sequenceFlow);
    this.selectedSequenceFlow = match ?? availableOptions[0];
    this.calculationContextService.setSelectPosition({ sequenceFlow: this.selectedSequenceFlow });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sequenceFlow']) {
      this.updateSelection(this.sequenceFlow)
    }
  }

  get positionOptions(): string[] {
    return this.calculationContextService.getAvailableSequenceFlows();
  }

  get dropdownOptions() {
    return this.positionOptions.map(opt => ({
      id: opt,
      name: opt
    }));
  }

  onSelectChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.updateSelection(selectedValue);
  }

  onDropdownChange(selected: { id: string; name: string }) {
    this.updateSelection(selected.id);
    this.interacted.emit();
  }

  private updateSelection(sequenceFlow: string): void {
    this.selectedSequenceFlow = sequenceFlow;
    const positionGroup: PositionGroup = { sequenceFlow: sequenceFlow };
    this.positionChange.emit(positionGroup);
    this.calculationContextService.setSelectPosition(positionGroup);
  }

  getSelectedOption(): IdName | null {
    return this.selectedSequenceFlow ?
      { id: this.selectedSequenceFlow, name: this.selectedSequenceFlow } : null;
  }

  onSequenceFlowChange(newSequenceFlow: string) {
    this.calculationContextService.onSequenceFlowChange(newSequenceFlow);
  }

}
