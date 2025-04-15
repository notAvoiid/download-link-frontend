// download-form.component.ts
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { YoutubeDownloadService } from '../../service/youtube-download.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-download-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './download-form.component.html',
  styleUrl: './download-form.component.scss'
})
export class DownloadFormComponent {
  private downloadService = inject(YoutubeDownloadService);
  private snackBar = inject(MatSnackBar);
  
  urlControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+/)
  ]);
  
  isLoading = false;

  onSubmit() {
    if (this.urlControl.invalid) return;
    
    this.isLoading = true;
    const url = this.urlControl.value!;

    this.downloadService.startDownload(url).subscribe({
      next: (response) => {
        this.downloadService.pollStatus(url).subscribe(status => {
          if (status === 'COMPLETED') {
            this.downloadService.downloadFile(response.filePath);
            this.snackBar.open('Download concluído!', 'Fechar', { duration: 3000 });
          }
          if (status === 'FAILED') {
            this.snackBar.open('Falha no download', 'Fechar');
          }
        });
      },
      error: (error) => {
        this.snackBar.open('Erro ao iniciar download: ' + error, 'Fechar');
        this.isLoading = false;
      },
      complete: () => this.isLoading = false
    });
  }
}