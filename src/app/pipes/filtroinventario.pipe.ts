import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroinventario',
  standalone: false
})
export class FiltroinventarioPipe implements PipeTransform {

  transform(items: any[], Folio: number | string, Equipo: string, Asignado: string): any[] {
    if (!items) {
      return items;
    }

    if (!Folio && !Equipo && !Asignado) {
      return items;
    }

    Folio = (Folio || Folio === 0) ? Folio.toString().toLowerCase() : '';
    Equipo = Equipo ? Equipo.toLowerCase() : '';
    Asignado = Asignado ? Asignado.toString().toLowerCase() : '';

    return items.filter(item => {
      const coincideNombre = Folio ? item.IdEquipo?.toString()?.toLowerCase().includes(Folio) : true;
      const coincideLote = Equipo ? item.MarcaModelo?.toString()?.toLowerCase().includes(Equipo) : true;
      const coincideIdHr = Asignado ? item.Nombre?.toString()?.toLowerCase().includes(Asignado) : true;

      return coincideNombre && coincideLote && coincideIdHr;
    });

  }

}
