import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  //update base url here(note: do not finish the url with "/")
  private baseUrl = 'https://pxy1qyo7zl.execute-api.eu-west-2.amazonaws.com/prod';

  constructor(private http: HttpClient) { }

  applicantCount: string = '';

  ngOnInit() {
    this.getApplicantCount();
  }

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

    const emailInput = document.getElementById('email') as HTMLInputElement;
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const phoneInput = document.getElementById('phone') as HTMLInputElement;
    const genderSelect = document.getElementById('gender') as HTMLSelectElement;
    const disabilitySelect = document.getElementById('disability') as HTMLSelectElement;
    const visaInput = document.getElementById('visa') as HTMLInputElement;

    formData.append('email', emailInput.value);
    formData.append('name', nameInput.value);
    formData.append('phoneNumber', phoneInput.value);
    formData.append('gender', genderSelect.value);
    formData.append('disability', disabilitySelect.value);
    formData.append('visaStatus', visaInput.value);

    const apiUrl = `${this.baseUrl}/upload`;

    this.http.post(apiUrl, formData, { responseType: 'text' as 'json' }).subscribe(
      response => {
        if (typeof response === 'string') {
          console.log('Upload successful (text response)', response);
          this.showSuccessMessage = true;

          setTimeout(() => {
            this.showSuccessMessage = false;
            emailInput.value = '';
            nameInput.value = '';
            phoneInput.value = '';
            genderSelect.selectedIndex = 0;
            disabilitySelect.selectedIndex = 0;
            visaInput.value = '';
            resumeInput.value = '';
            window.location.reload();
          }, 3000);
        } else {
          console.log('Upload successful (JSON response)', response);
        }
      },
      error => {
        console.error('Upload failed', error);
      }
    );
  }

  getApplicantCount() {
    const apiUrl = `${this.baseUrl}/get-count`;

    this.http.get(apiUrl, { responseType: 'text' as 'json' }).subscribe(
      response => {
        if (typeof response === 'string') {
          this.applicantCount = response;
        }
      },
      error => {
        console.error('Error fetching applicant count', error);
      }
    );
  }

}
