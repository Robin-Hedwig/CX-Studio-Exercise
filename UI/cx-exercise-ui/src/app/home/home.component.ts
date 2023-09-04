import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  //update base url here
  private baseUrl = 'https://fl12lc9jxk.execute-api.eu-west-2.amazonaws.com/prod/'; 

  constructor(private http: HttpClient) {}

  showSuccessMessage = false;

  onFormSubmit() {
    const formData = new FormData();
    const resumeInput = document.getElementById('resume') as HTMLInputElement;

    if (resumeInput.files && resumeInput.files.length > 0) {
      formData.append('file', resumeInput.files[0]);
    } else {
      console.error('No file selected');
      return;
    }

    formData.append('email', (document.getElementById('email') as HTMLInputElement).value);
    formData.append('name', (document.getElementById('name') as HTMLInputElement).value);
    formData.append('phoneNumber', (document.getElementById('phone') as HTMLInputElement).value);
    formData.append('gender', (document.getElementById('gender') as HTMLSelectElement).value);
    formData.append('disability', (document.getElementById('disability') as HTMLSelectElement).value);
    formData.append('visaStatus', (document.getElementById('visa') as HTMLInputElement).value);

    const apiUrl = `${this.baseUrl}/upload`;

    this.http.post(apiUrl, formData).subscribe(
      response => {
        console.log('Upload successful', response);
        this.showSuccessMessage = true;

        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error => {
        console.error('Upload failed', error);
      }
    );
  }
}
