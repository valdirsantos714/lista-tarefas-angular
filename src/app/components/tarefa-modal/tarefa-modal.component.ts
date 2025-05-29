import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CategoriaEnum } from '../../models/enums/categoria.enum';
import { PrioridadeEnum } from '../../models/enums/prioridade.enum';
import { TarefaService } from '../../core/services/tarefa.service';
import { TarefaAtualizarDto, TarefaCriarDto, TarefaResponseDto } from '../../models/tarefa.model';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-tarefa-modal',
  templateUrl: './tarefa-modal.component.html',
  styleUrls: ['./tarefa-modal.component.css']
})
export class TarefaModalComponent implements OnInit, OnDestroy {
  formularioTarefa!: FormGroup;
  categorias = Object.values(CategoriaEnum);
  prioridades = Object.values(PrioridadeEnum);
  modoEdicao = false;
  private destruir$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private tarefaService: TarefaService,
    private dialogRef: MatDialogRef<TarefaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dados: TarefaResponseDto | null
  ) {}

  ngOnInit(): void {
    this.formularioTarefa = this.fb.group({
      id: [{ value: null, disabled: true }],
      nomeTarefa: ['', Validators.required],
      categoria: ['', Validators.required],
      prioridade: ['', Validators.required],
      dataFinalDeFinalizacao: [null, Validators.required]
    });
  
    if (this.dados) {
      this.modoEdicao = true;
      const dataFormatada = new Date(this.dados.dataFinalDeFinalizacao);
      
      this.formularioTarefa.patchValue({
        id: this.dados.id,
        nomeTarefa: this.dados.nomeTarefa,
        categoria: this.dados.categoria,
        prioridade: this.dados.prioridade,
        dataFinalDeFinalizacao: dataFormatada
      });
    }
  }

  updateDate(event: MatDatepickerInputEvent<Date>) {
    this.formularioTarefa.patchValue({
      dataFinalDeFinalizacao: event.value
    });
  }

  salvar(): void {
    if (this.formularioTarefa.invalid) {
      return;
    }

    const tarefa: TarefaCriarDto | TarefaAtualizarDto = {
      nomeTarefa: this.formularioTarefa.get('nomeTarefa')?.value,
      categoria: this.formularioTarefa.get('categoria')?.value,
      prioridade: this.formularioTarefa.get('prioridade')?.value,
      dataFinalDeFinalizacao: this.formularioTarefa.get('dataFinalDeFinalizacao')?.value
    };

    if (this.modoEdicao && this.dados) {
      const tarefaAtualizada: TarefaAtualizarDto = {
        ...tarefa,
        id: this.dados.id
      };
      this.tarefaService.atualizarTarefa(tarefaAtualizada)
        .pipe(takeUntil(this.destruir$))
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (erro) => {console.error('Erro ao atualizar tarefa:', erro); alert('Erro ao atualizar tarefa: ' + erro);}
        });
    } else {
      this.tarefaService.criarTarefa(tarefa)
        .pipe(takeUntil(this.destruir$))
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (erro) => {console.error('Erro ao criar tarefa:', erro); alert('Erro ao criar tarefa: olhe o console pra mais informações');}
        });
    }
  }

  fechar(): void {
    this.dialogRef.close(false);
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }
}
