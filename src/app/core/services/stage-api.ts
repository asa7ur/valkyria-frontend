import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Stage} from '../models/stage';
import {ResponseDTO} from '../models/response-dto';

@Injectable({providedIn: 'root'})
export class StageApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/stages';

  getStages(page: number = 0, itemsPerPage: number = 10, search: string = ''): Observable<ResponseDTO<Stage[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('itemsPerPage', itemsPerPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ResponseDTO<Stage[]>>(this.apiUrl, {params});
  }

  getStageById(id: string): Observable<ResponseDTO<Stage>> {
    return this.http.get<ResponseDTO<Stage>>(`${this.apiUrl}/${id}`);
  }

  createStage(stageData: any): Observable<ResponseDTO<Stage>> {
    return this.http.post<ResponseDTO<Stage>>(this.apiUrl, stageData);
  }

  updateStage(id: number, stageData: any): Observable<ResponseDTO<Stage>> {
    return this.http.put<ResponseDTO<Stage>>(`${this.apiUrl}/${id}`, stageData);
  }

  deleteStage(id: number): Observable<ResponseDTO<void>> {
    return this.http.delete<ResponseDTO<void>>(`${this.apiUrl}/${id}`);
  }
}
