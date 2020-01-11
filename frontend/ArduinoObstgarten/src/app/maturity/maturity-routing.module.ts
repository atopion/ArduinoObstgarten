import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MaturityPage } from './maturity.page';

const routes: Routes = [
  {
    path: '',
    component: MaturityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaturityPageRoutingModule {}
