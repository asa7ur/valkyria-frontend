import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CampingType, CampingTypeCreateDTO} from '../models/ticket-types';

@Injectable({
  providedIn: 'root'
})
export class CampingTypeApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/camping-types';

  getAllCampingTypes(): Observable<CampingType[]> {
    return this.http.get<CampingType[]>(this.apiUrl);
  }

  getCampingTypeById(id: number): Observable<CampingType> {
    return this.http.get<CampingType>(`${this.apiUrl}/${id}`);
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
