import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  catchError,
  interval,
  map,
  switchMap,
  throwError,
  tap,
  takeWhile,
  finalize,
  timer,
} from 'rxjs';

export type DownloadStatus = 'STARTING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

@Injectable({ providedIn: 'root' })
export class YoutubeDownloadService {
  private http = inject(HttpClient);
  private statusSubject = new BehaviorSubject<{ status: DownloadStatus } | null>(null);
  private baseUrl = 'https://download-link-t62w.onrender.com'; // Base URL added

  status$ = this.statusSubject.asObservable();

  startDownload(url: string): Observable<{ filePath: string; status: DownloadStatus }> {
    this.statusSubject.next({ status: 'STARTING' });
  
    const delayBeforeInProgress = timer(1250).pipe(
      tap(() => this.statusSubject.next({ status: 'IN_PROGRESS' }))
    );
  
    return delayBeforeInProgress.pipe(
      switchMap(() =>
        this.http.post<{ filePath: string; status: DownloadStatus }>(`${this.baseUrl}/api/download`, { url }).pipe(
          switchMap(response =>
            this.pollStatus(url).pipe(
              map(finalStatus => ({
                filePath: response.filePath,
                status: finalStatus,
              }))
            )
          ),
          catchError(error => {
            console.error('Download error:', error);
            this.statusSubject.next({ status: 'FAILED' });
            return throwError(() => error);
          }),
          finalize(() => console.log('Download process finalized'))
        )
      )
    );
  }
  
  getDownloadStatus(url: string): Observable<DownloadStatus> {
    return this.http.get<{ status: DownloadStatus }>(`${this.baseUrl}/api/status`, {
      params: { url },
    }).pipe(
      map(response => response.status)
    );
  }

  pollStatus(url: string): Observable<DownloadStatus> {
    return interval(1000).pipe(
      switchMap(() => this.getDownloadStatus(url)),
      tap(status => this.statusSubject.next({ status })),
      takeWhile(status => status === 'STARTING' || status === 'IN_PROGRESS', true),
      finalize(() => console.log('Polling finalized'))
    );
  }

  downloadFile(filePath: string): void {
    const filename = filePath.split('/').pop() || 'audio.mp3';

    // Use baseUrl for file download
    this.http.get(`${this.baseUrl}/api/download/${filename}`, { responseType: 'blob' })
      .pipe(
        catchError(err => {
          console.error('File download failed:', err);
          return throwError(() => err);
        })
      )
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  clearStatus(): void {
    this.statusSubject.next(null);
  }
}