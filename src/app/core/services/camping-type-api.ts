import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CampingType, CampingTypeCreateDTO} from '../models/ticket-types';
import {ResponseDTO} from '../models/response-dto';

@Injectable({
  providedIn: 'root'
})
export class CampingTypeApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/camping-types';

  getCampingTypes(page: number = 0, itemsPerPage: number = 10, search: string = ''): Observable<ResponseDTO<CampingType[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('itemsPerPage', itemsPerPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ResponseDTO<CampingType[]>>(this.apiUrl, {params});
  }

  getCampingTypeById(id: string): Observable<ResponseDTO<CampingType>> {
    return this.http.get<ResponseDTO<CampingType>>(`${this.apiUrl}/${id}`);
  }

  createCampingType(dto: CampingTypeCreateDTO): Observable<CampingType> {
    return this.http.post<CampingType>(this.apiUrl, dto);
  }

  updateCampingType(id: number, dto: CampingTypeCreateDTO): Observable<CampingType> {
    return this.http.put<CampingType>(`${this.apiUrl}/${id}`, dto);
  }

  deleteCampingType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
