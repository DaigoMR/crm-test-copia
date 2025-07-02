import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  private urlListarInventario = environment.api + 'general/listar_inventarionuevo';
  private urlListarTipoEquipo = environment.api + 'general/listar_tipo_equipo';
  private urlGuardarRegistroEquipo = environment.api + 'general/guardar_registro_equipo';
  private urlReasignarEquipo = environment.api + 'general/reasignar_equipoNUEVO';
  private urlCambiarEstadoEquipo = environment.api + 'general/cambiar_estado_equipo';
  private urlObtenerEquipoId = environment.api + 'general/ObtenerEquipoId';
  private urlListarUsuarios = environment.api + 'general/listar_usuarios';

  constructor(private http: HttpClient) { }

  public listarInventario() {
    return this.http.get(this.urlListarInventario);
  }
  public listarTipoEquipo(data: any) {
    return this.http.post(this.urlListarTipoEquipo, data);
  }
  public guardarRegistroEquipo(data: any) {
    return this.http.post(this.urlGuardarRegistroEquipo, data);
  }
  public ReasignarEquipo(data: any) {
    return this.http.post(this.urlReasignarEquipo, data);
  }
  public CambiarEstadoEquipo(data: any) {
    return this.http.post(this.urlCambiarEstadoEquipo, data);
  }
  public ObtenerEquipoId(data: any) {
    return this.http.post(this.urlObtenerEquipoId, data);
  }
  public listarUsuarios(data: any) {
    return this.http.post(this.urlListarUsuarios, data);
  }
}
