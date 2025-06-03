// tarefa-lista.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TarefaListaComponent } from './tarefa-lista.component';
import { TarefaService } from '../../core/services/tarefa.service';
import { MatDialog } from '@angular/material/dialog';
import { TarefaResponseDto } from '../../models/tarefa.model';
import { CategoriaEnum } from '../../models/enums/categoria.enum';
import { PrioridadeEnum } from '../../models/enums/prioridade.enum';

describe('TarefaListaComponent', () => {
  let component: TarefaListaComponent;
  let fixture: ComponentFixture<TarefaListaComponent>;
  let mockTarefaService: jest.Mocked<TarefaService>;
  let mockMatDialog: jest.Mocked<MatDialog>;

  const tarefasMock: TarefaResponseDto[] = [
    { id: 1, nomeTarefa: 'Comer', categoria: CategoriaEnum.PESSOAL, prioridade: PrioridadeEnum.ALTA, dataFinalDeFinalizacao: new Date() }
  ];

  beforeEach(async () => {
    mockTarefaService = {
      listarTarefas: jest.fn().mockReturnValue(of([])), // <-- importante
      deletarTarefa: jest.fn()
    } as any;
    

    mockMatDialog = {
      open: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      declarations: [TarefaListaComponent],
      providers: [
        { provide: TarefaService, useValue: mockTarefaService },
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TarefaListaComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks successfully', () => {
    // Given
    mockTarefaService.listarTarefas.mockReturnValue(of(tarefasMock));

    // When
    component.carregarTarefas();

    // Then
    expect(mockTarefaService.listarTarefas).toHaveBeenCalled();
    expect(component.tarefas).toEqual(tarefasMock);
  });

  it('should handle error when loading tasks', () => {
    // Given
    const erro = new Error('Erro ao carregar');
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockTarefaService.listarTarefas.mockReturnValue(throwError(() => erro));

    // When
    component.carregarTarefas();

    // Then
    expect(mockTarefaService.listarTarefas).toHaveBeenCalled();
    expect(component.tarefas).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('Erro ao carregar tarefas:', erro);
  });

  it('should open modal and reload tasks if modal returns result', () => {
    // Given
    const dialogRefSpy = { afterClosed: () => of(true) };
    mockMatDialog.open.mockReturnValue(dialogRefSpy as any);
    const carregarSpy = jest.spyOn(component, 'carregarTarefas');

    // When
    component.abrirModal();

    // Then
    expect(mockMatDialog.open).toHaveBeenCalled();
    expect(carregarSpy).toHaveBeenCalled();
  });

  it('should not reload tasks if modal is closed without result', () => {
    // Given
    const dialogRefSpy = { afterClosed: () => of(false) };
    mockMatDialog.open.mockReturnValue(dialogRefSpy as any);
    const carregarSpy = jest.spyOn(component, 'carregarTarefas');

    // When
    component.abrirModal();

    // Then
    expect(mockMatDialog.open).toHaveBeenCalled();
    expect(carregarSpy).not.toHaveBeenCalled();
  });

  it('should remove task successfully and reload the list', async () => {
    // Given
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const loadSpy = jest.spyOn(component, 'carregarTarefas');
    mockTarefaService.deletarTarefa.mockReturnValue(of(undefined));
  
    // When
    await component.removerTarefa(1);
    fixture.detectChanges();
  
    // Then
    expect(mockTarefaService.deletarTarefa).toHaveBeenCalledWith(1);
    expect(loadSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Tarefa removida com sucesso');
  });
  
  it('should display error when failing to remove task', () => {
    // Given
    const erro = new Error('Erro na remoção');
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    mockTarefaService.deletarTarefa.mockReturnValue(throwError(() => erro));

    // When
    component.removerTarefa(1);

    // Then
    expect(mockTarefaService.deletarTarefa).toHaveBeenCalledWith(1);
    expect(alertSpy).toHaveBeenCalledWith('Erro ao remover tarefa:' + erro);
    expect(console.log).toHaveBeenCalledWith('Erro ao remover tarefa:', erro);
  });
});
