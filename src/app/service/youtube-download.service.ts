import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, interval, map, switchMap, throwError, tap, takeWhile, finalize, BehaviorSubject } from 'rxjs';

export type DownloadStatus = 'STARTING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

@Injectable({ providedIn: 'root' })
export class YoutubeDownloadService {
  private http = inject(HttpClient);
  private statusSubject = new BehaviorSubject<{ status: DownloadStatus } | null>(null);
  
  status$ = this.statusSubject.asObservable();

  //ToDo: Handle downloadstatus
  startDownload(url: string): Observable<{filePath: string, status: DownloadStatus }> {
    this.statusSubject.next({ status: 'STARTING' });
    
    return this.http.post<{ filePath: string, status: DownloadStatus }>(
      '/api/download',
      { url }
    ).pipe(
      tap(response => this.statusSubject.next({ 
        status: response.status,
      })),
      catchError(error => {
        this.statusSubject.next({ status: 'FAILED' });
        return throwError(() => error);
      })
    );
  }

  getDownloadStatus(url: string): Observable<DownloadStatus> {
    return this.http.get<{ status: DownloadStatus }>('/api/status', {
      params: { url }
    }).pipe(
      map(response => response.status)
    );
  }

  pollStatus(url: string): Observable<DownloadStatus> {
    return interval(1000).pipe(
      switchMap(() => this.getDownloadStatus(url)),
      takeWhile(status => status === 'STARTING' || status === 'IN_PROGRESS', true)
    );
  }

  downloadFile(filePath: string): void {
    const filename = filePath.split('/').pop() || 'audio.mp3';
    this.http.get(`/api/download/${filename}`, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}