import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MaturityPage } from './maturity.page';

describe('MaturityPage', () => {
  let component: MaturityPage;
  let fixture: ComponentFixture<MaturityPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaturityPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MaturityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
