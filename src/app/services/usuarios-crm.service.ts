import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class UsuariosCrmService {

  private urlInsertarEquipo = environment.api + 'crm_usuarios/insertar_equipo';
  private urlObtenerEquiposPorPersona =
    environment.api + 'crm_usuarios/obtener_equipos_por_persona';
  private urlEliminarEquipo = environment.api + 'crm_usuarios/eliminar_equipo';

  constructor(private http: HttpClient) { }

  public InsertarEquipo(data: any) {
    return this.http.post(this.urlInsertarEquipo, data);
  }

  public obtenerEquiposPorPersona(data: any): Observable<any[]> {
    return this.http.post<any[]>(this.urlObtenerEquiposPorPersona, data);
  }

  public EliminarEquipo(data: any): Observable<any[]> {
    return this.http.post<any[]>(this.urlEliminarEquipo, data);
  }
}
