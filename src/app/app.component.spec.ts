import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TarefaListaComponent } from './components/tarefa-lista/tarefa-lista.component';
import { TarefaResponseDto } from './models/tarefa.model';
import { CategoriaEnum } from './models/enums/categoria.enum';
import { PrioridadeEnum } from './models/enums/prioridade.enum';
import { TarefaService } from './core/services/tarefa.service';

describe('TarefaListaComponent', () => {
  let component: TarefaListaComponent;
  let fixture: ComponentFixture<TarefaListaComponent>;
  let tarefaServiceMock: any;
  let dialogMock: any;

  const tarefaExemplo: TarefaResponseDto = {
    id: 1,
    nomeTarefa: 'Estudar Angular',
    categoria: CategoriaEnum.ESTUDO,
    prioridade: PrioridadeEnum.MEDIA,
    dataFinalDeFinalizacao: new Date()
  };

  beforeEach(() => {
    tarefaServiceMock = {
      listarTarefas: jest.fn(),
      deletarTarefa: jest.fn()
    };

    dialogMock = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true)
      })
    };

    TestBed.configureTestingModule({
      declarations: [TarefaListaComponent],
      providers: [
        { provide: TarefaService, useValue: tarefaServiceMock },
        { provide: MatDialog, useValue: dialogMock }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignora elementos do Angular Material
    });

    fixture = TestBed.createComponent(TarefaListaComponent);
    component = fixture.componentInstance;
  });

  it('should load tasks on init', () => {
    // Given
    tarefaServiceMock.listarTarefas.mockReturnValue(of([tarefaExemplo]));

    // When
    fixture.detectChanges(); // chama ngOnInit

    // Then
    expect(component.tarefas).toEqual([tarefaExemplo]);
    expect(tarefaServiceMock.listarTarefas).toHaveBeenCalled();
  });

  it('should show error if task loading fails', () => {
    // Given
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    tarefaServiceMock.listarTarefas.mockReturnValue(throwError(() => new Error('Erro')));

    // When
    component.carregarTarefas();

    // Then
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar tarefas:', expect.any(Error));
  });

  it('should open modal and reload tasks after close', () => {
    // Given
    tarefaServiceMock.listarTarefas.mockReturnValue(of([]));

    // When
    component.abrirModal(tarefaExemplo);

    // Then
    expect(dialogMock.open).toHaveBeenCalled();
    expect(tarefaServiceMock.listarTarefas).toHaveBeenCalled();
  });

  it('should delete task and reload list', () => {
    // Given
    tarefaServiceMock.deletarTarefa.mockReturnValue(of(undefined));
    tarefaServiceMock.listarTarefas.mockReturnValue(of([]));
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    // When
    component.removerTarefa(1);

    // Then
    expect(tarefaServiceMock.deletarTarefa).toHaveBeenCalledWith(1);
    expect(alertSpy).toHaveBeenCalledWith('Tarefa removida com sucesso');
    expect(tarefaServiceMock.listarTarefas).toHaveBeenCalled();
  });

  it('should handle error on delete', () => {
    // Given
    const error = new Error('Erro de exclusão');
    tarefaServiceMock.deletarTarefa.mockReturnValue(throwError(() => error));
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // When
    component.removerTarefa(1);

    // Then
    expect(alertSpy).toHaveBeenCalledWith('Erro ao remover tarefa:' + error);
    expect(logSpy).toHaveBeenCalledWith('Erro ao remover tarefa:', error);
  });
});
