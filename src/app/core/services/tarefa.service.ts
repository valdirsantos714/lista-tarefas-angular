import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Observable, catchError, map, throwError } from 'rxjs';
import { TarefaAtualizarDto, TarefaCriarDto, TarefaResponseDto } from '../../models/tarefa.model';
import { CategoriaEnum } from '../../models/enums/categoria.enum';
import { PrioridadeEnum } from '../../models/enums/prioridade.enum';

@Injectable({
  providedIn: 'root'
})
export class TarefaService {
  private readonly apiUrl = 'http://localhost:8080/tarefas';

  constructor(private http: HttpClient) {}

  criarTarefa(tarefa: TarefaCriarDto): Observable<TarefaResponseDto> {
    return this.http.post<TarefaResponseDto>(`${this.apiUrl}/criar`, tarefa)
      .pipe(
        catchError(error => throwError(() => new Error(error)))
      );
  }

  listarTarefas(): Observable<TarefaResponseDto[]> {
    return this.http.get<TarefaResponseDto[]>(`${this.apiUrl}/listar`).pipe(
      map((tarefas: TarefaResponseDto[]) => {
        return tarefas.map(tarefa => ({
          ...tarefa,
          categoria: CategoriaEnum[tarefa.categoria as keyof typeof CategoriaEnum],
          prioridade: PrioridadeEnum[tarefa.prioridade as keyof typeof PrioridadeEnum],
          dataFinalDeFinalizacao: new Date(tarefa.dataFinalDeFinalizacao)
        }));
      }),
      catchError(error => {
        console.error('Erro ao listar tarefas:', error);
        return throwError(() => new Error('Erro ao carregar tarefas'));
      })
    );
  }

  procurarTarefas(params: any): Observable<TarefaResponseDto[]> {
    return this.http.get<TarefaResponseDto[]>(`${this.apiUrl}/procurar`, { params })
      .pipe(
        map(tarefas => tarefas.map(tarefa => ({
          ...tarefa,
          categoria: CategoriaEnum[tarefa.categoria],
          prioridade: PrioridadeEnum[tarefa.prioridade],
          dataFinalDeFinalizacao: new Date(tarefa.dataFinalDeFinalizacao)
        }))),
        catchError(error => throwError(() => new Error(error)))
      );
  }

  atualizarTarefa(tarefa: TarefaAtualizarDto): Observable<TarefaResponseDto> {
    return this.http.put<TarefaResponseDto>(
      `${this.apiUrl}/atualizar`, 
      tarefa,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  deletarTarefa(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensagem: ${error.message}`;
      
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
