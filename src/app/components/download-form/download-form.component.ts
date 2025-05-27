import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { YoutubeDownloadService } from '../../service/youtube-download.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, map, switchMap, take } from 'rxjs';

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
  
  urlControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+/)
  ]);
  
  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.urlControl.invalid) return;

    this.isLoading = true;
    const url = this.urlControl.value!;

    this.downloadService.startDownload(url).subscribe({
      next: (response) => {
        this.downloadService.pollStatus(url).subscribe(status => {
          if (status === 'COMPLETED') {
            this.downloadService.downloadFile(response.filePath);
          } else if (status === 'FAILED') {
            this.errorMessage = 'O download falhou. Tente novamente.';
          }
        });
      },
      error: (error) => {
        if (error.error instanceof ErrorEvent) {
          this.errorMessage = error.error.message;
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = `Erro ${error.status}: ${error.statusText}`;
        }
        this.isLoading = false;
      },
      complete: () => this.isLoading = false
    });
  }
}