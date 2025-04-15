// status-display.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadStatus, YoutubeDownloadService } from '../../service/youtube-download.service';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, animate, style } from '@angular/animations';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-status-display',
  standalone: true,
  animations: [
    trigger('statusAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatProgressBar
  ],
  templateUrl: './status-display.component.html',
  styleUrls: ['./status-display.component.scss']
})
export class StatusDisplayComponent implements OnInit, OnDestroy {
  currentStatus: DownloadStatus | null = null;
  private statusSubscription!: Subscription;

  statusMessages = {
    STARTING: 'Iniciando conversão...',
    IN_PROGRESS: 'Conversão em andamento...',
    COMPLETED: 'Conversão concluída! 🎉',
    ALREADY_EXISTS: 'Arquivo já existe ✅',
    FAILED: 'Falha na conversão ⚠️'
  };

  constructor(private downloadService: YoutubeDownloadService) {}

  ngOnInit() {
    this.statusSubscription = this.downloadService.status$.subscribe({
      next: (status) => {
        this.currentStatus = status?.status || null;
      },
      error: (err) => console.error('Erro no status:', err)
    });
  }

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  clearStatus() {
    this.currentStatus = null;
  }
}