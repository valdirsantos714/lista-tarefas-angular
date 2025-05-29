import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarefaListaComponent } from './tarefa-lista.component';

describe('TarefaListaComponent', () => {
  let component: TarefaListaComponent;
  let fixture: ComponentFixture<TarefaListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TarefaListaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TarefaListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
