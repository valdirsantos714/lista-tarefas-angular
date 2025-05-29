// src/app/tarefas/tarefa-lista/tarefa-lista.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TarefaService } from '../../core/services/tarefa.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { TarefaResponseDto } from '../../models/tarefa.model';
import { MatDialog } from '@angular/material/dialog';
import { TarefaModalComponent } from '../tarefa-modal/tarefa-modal.component';

@Component({
  selector: 'app-tarefa-lista',
  templateUrl: './tarefa-lista.component.html',
  styleUrls: ['./tarefa-lista.component.css'],
})
export class TarefaListaComponent implements OnInit, OnDestroy {
  tarefas: TarefaResponseDto[] = [];
  private destroy$ = new Subject<void>();

  constructor(private tarefaService: TarefaService, private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarTarefas();
  }

  carregarTarefas(): void {
    this.tarefaService.listarTarefas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tarefas) => {
          this.tarefas = tarefas;
        },
        error: (err) => {
          console.error('Erro ao carregar tarefas:', err);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  abrirModal(tarefa?: TarefaResponseDto): void {
    const dialogRef = this.dialog.open(TarefaModalComponent, {
      width: '600px',
      data: tarefa || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carregarTarefas(); 
      }
    });
  }

  removerTarefa(id: number): void {

      this.tarefaService.deletarTarefa(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Atualiza a lista após remoção
            this.carregarTarefas();
            alert('Tarefa removida com sucesso');
          },
          error: (err) => {
            alert('Erro ao remover tarefa:' + err);
            console.log('Erro ao remover tarefa:', err);
          }
        });
  }
}
