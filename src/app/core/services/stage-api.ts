import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Stage} from '../models/stage';
import {PageResponse} from '../models/page-response';

@Injectable({providedIn: 'root'})
export class StageApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/stages';

  getStages(page: number = 0, size: number = 10, search: string = ''): Observable<PageResponse<Stage>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PageResponse<Stage>>(this.apiUrl, {params});
  }

  getStageById(id: string): Observable<Stage> {
    return this.http.get<Stage>(`${this.apiUrl}/${id}`);
  }

  createStage(stageData: any): Observable<Stage> {
    return this.http.post<Stage>(this.apiUrl, stageData);
  }

  updateStage(id: number, stageData: any): Observable<Stage> {
    return this.http.put<Stage>(`${this.apiUrl}/${id}`, stageData);
  }

  deleteStage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
