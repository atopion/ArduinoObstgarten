import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MaturityPageRoutingModule } from './maturity-routing.module';

import { MaturityPage } from './maturity.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaturityPageRoutingModule
  ],
  declarations: [MaturityPage]
})
export class MaturityPageModule {}
