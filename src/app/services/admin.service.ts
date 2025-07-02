import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  //* Vehículos
  private urlVehiculosObtenerRegistros = environment.api + 'admin/crm_vehiculos_obtener_registros';
  private urlVehiculosObtenerDisponibles = environment.api + 'admin/crm_vehiculos_obtener_disponibles';
  private urlVehiculosInsertarSolicitud = environment.api + 'admin/crm_vehiculos_insertar_solicitud';
  private urlVehiculosModificarSolicitud = environment.api + 'admin/crm_vehiculos_modificar_solicitud';
  private urlVehiculosModificarDatosSolicitud = environment.api + 'admin/crm_vehiculos_modificar_datos_solicitud';
  public urlVehiculosSubirDocumentos = environment.dominio + 'api/storage/documentos_solicitud_vehiculo.php';
  public urlVehiculosSubirDocumentosTest = environment.dominio + 'api/storage/documentos_solicitud_vehiculo_test.php';
  private urlVehiculosArchivosSolicitud = environment.api + 'admin/crm_vehiculos_archivos_solicitud';
  private urlObtenerDepartamentos = environment.api + 'admin/departamentos';
  public urlSubirImgEquipo = environment.dominio + 'api/storage/img_equipo.php';

  constructor(private http: HttpClient) { }

  //* Vehículos
  public vehiculosObtenerRegistros(data: any) {
    return this.http.post(this.urlVehiculosObtenerRegistros, data);
  }
  public vehiculosObtenerDisponibles() {
    return this.http.get(this.urlVehiculosObtenerDisponibles);
  }

  public vehiculosInsertarSolicitud(data: any) {
    return this.http.post(this.urlVehiculosInsertarSolicitud, data);
  }

  public vehiculosModificarSolicitud(data: any) {
    return this.http.post(this.urlVehiculosModificarSolicitud, data);
  }

  public vehiculosModificarDatosSolicitud(data: any) {
    return this.http.post(this.urlVehiculosModificarDatosSolicitud, data);
  }

  public vehiculosSubirDocumentos(data: any) {
    return this.http.post(this.urlVehiculosSubirDocumentos, data).toPromise();
  }

  public vehiculosSubirDocumentosTest(data: any) {
    return this.http.post(this.urlVehiculosSubirDocumentosTest, data).toPromise();
  }

  public vehiculosArchivosSolicitud(data: any) {
    return this.http.post(this.urlVehiculosArchivosSolicitud, data);
  }

  public ObtenerDepartamentos() {
    return this.http.get(this.urlObtenerDepartamentos);
  }

  public SubirImgEquipo(data: FormData) {
    return this.http.post(this.urlSubirImgEquipo, data);
  }
}
