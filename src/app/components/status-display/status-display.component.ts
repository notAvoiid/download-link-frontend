import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
export class StatusDisplayComponent {
  statusMessages: Record<DownloadStatus, string> = {
    STARTING: 'Iniciando conversão...',
    IN_PROGRESS: 'Conversão em andamento...',
    COMPLETED: 'Conversão concluída! 🎉',
    FAILED: 'Falha na conversão ⚠️'
  };

  downloadService = inject(YoutubeDownloadService);

  clearStatus() {
    // Lógica para limpar status, pode ser ajustada conforme necessário
  }

  get estimatedTime(): string {
    return '1-3 minutos';  // Pode ser dinâmico se você souber a duração do download
  }
}
