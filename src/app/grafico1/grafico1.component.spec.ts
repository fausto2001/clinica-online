import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Grafico1Component } from './grafico1.component';

describe('Grafico1Component', () => {
  let component: Grafico1Component;
  let fixture: ComponentFixture<Grafico1Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Grafico1Component]
    });
    fixture = TestBed.createComponent(Grafico1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
