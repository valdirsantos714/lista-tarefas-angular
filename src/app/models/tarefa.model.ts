import { CategoriaEnum } from './enums/categoria.enum';
import { PrioridadeEnum } from './enums/prioridade.enum';

export interface TarefaCriarDto {
  nomeTarefa: string;
  categoria: CategoriaEnum;
  prioridade: PrioridadeEnum;
  dataFinalDeFinalizacao: Date;
}

export interface TarefaAtualizarDto extends TarefaCriarDto {
  id: number;
}

export interface TarefaResponseDto {
  id: number;
  nomeTarefa: string;
  categoria: CategoriaEnum;
  prioridade: PrioridadeEnum;
  dataFinalDeFinalizacao: Date;
}