import { NgModule } from "@angular/core";
import { FiltroinventarioPipe } from "./filtroinventario.pipe";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [
    FiltroinventarioPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FiltroinventarioPipe
  ]
})
export class PipesModule { }
