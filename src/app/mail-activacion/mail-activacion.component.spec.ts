import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailActivacionComponent } from './mail-activacion.component';

describe('MailActivacionComponent', () => {
  let component: MailActivacionComponent;
  let fixture: ComponentFixture<MailActivacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MailActivacionComponent]
    });
    fixture = TestBed.createComponent(MailActivacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
