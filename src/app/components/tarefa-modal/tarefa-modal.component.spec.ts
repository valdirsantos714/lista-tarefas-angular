import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TarefaModalComponent } from './tarefa-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatOptionModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TarefaService } from '../../core/services/tarefa.service';
import { of, throwError } from 'rxjs';
import { CategoriaEnum } from '../../models/enums/categoria.enum';
import { PrioridadeEnum } from '../../models/enums/prioridade.enum';
import { TarefaResponseDto } from '../../models/tarefa.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TarefaModalComponent', () => {
  let component: TarefaModalComponent;
  let fixture: ComponentFixture<TarefaModalComponent>;
  let mockTarefaService: jest.Mocked<TarefaService>;
  let mockDialogRef: jest.Mocked<MatDialogRef<TarefaModalComponent>>;

  beforeEach(async () => {
    mockTarefaService = {
      criarTarefa: jest.fn(),
      atualizarTarefa: jest.fn()
    } as any;

    mockDialogRef = {
      close: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      declarations: [TarefaModalComponent],
      imports: [
        ReactiveFormsModule,
        MatSelectModule,
        MatOptionModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        NoopAnimationsModule,
        BrowserAnimationsModule,
        MatDialogModule,
      ],
      providers: [
        { provide: TarefaService, useValue: mockTarefaService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TarefaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    // Given nothing

    // When component initializes

    // Then component should be defined
    expect(component).toBeTruthy();
  });

  it('should initialize form with data when in edit mode', () => {
    // Given component receives existing task data
    const taskData: TarefaResponseDto = {
      id: 1,
      nomeTarefa: 'Test task',
      categoria: CategoriaEnum.TRABALHO,
      prioridade: PrioridadeEnum.ALTA,
      dataFinalDeFinalizacao: new Date()
    };

    component.dados = taskData;

    // When component initializes
    component.ngOnInit();

    // Then form should be populated with task data
    expect(component.modoEdicao).toBe(true);
    expect(component.formularioTarefa.value.nomeTarefa).toBe(taskData.nomeTarefa);
  });

  it('should not call save methods if form is invalid', () => {
    // Given invalid form
    component.formularioTarefa.patchValue({ nomeTarefa: '', categoria: '', prioridade: '', dataFinalDeFinalizacao: null });

    // When trying to save
    component.salvar();

    // Then no service call should happen
    expect(mockTarefaService.criarTarefa).not.toHaveBeenCalled();
    expect(mockTarefaService.atualizarTarefa).not.toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should show error on creation failure', () => {
    // Given form is valid and service fails
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    component.formularioTarefa.setValue({
      id: null,
      nomeTarefa: 'Erro',
      categoria: CategoriaEnum.SAUDE,
      prioridade: PrioridadeEnum.MEDIA,
      dataFinalDeFinalizacao: new Date()
    });

    mockTarefaService.criarTarefa.mockReturnValue(throwError(() => 'Erro na criação'));

    // When saving
    component.salvar();

    // Then alert should be shown
    expect(alertSpy).toHaveBeenCalledWith('Erro ao criar tarefa: olhe o console pra mais informações');
  });

  it('should close dialog with false on cancel', () => {
    // Given nothing

    // When closing
    component.fechar();

    // Then dialog should be closed with false
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
