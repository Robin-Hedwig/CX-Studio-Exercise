import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  // Update base URL here (note: do not finish the URL with "/")
  private baseUrl = 'https://pxy1qyo7zl.execute-api.eu-west-2.amazonaws.com/prod';

  newKeyword = '';
  keywords = '';
  applicants: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getApplicants();
    this.keywords = localStorage.getItem('keywords') || '';
  }

  addKeyword() {
    if (this.newKeyword) {
      if (this.keywords) {
        this.keywords += ', ' + this.newKeyword;
      } else {
        this.keywords = this.newKeyword;
      }
      this.newKeyword = '';
      localStorage.setItem('keywords', this.keywords);
    }
  }

  matchKeywords() {
    const requestData = {
      keywords: this.keywords
    };

    this.http.post(`${this.baseUrl}/match-percentage`, requestData).subscribe(
      () => {
        window.location.reload();
      },
      error => {
        console.error('Error matching keywords', error);
      }
    );
  }

  clearKeywords() {
    this.keywords = '';
    localStorage.removeItem('keywords');
  }

  getApplicants() {
    this.http.get<any[]>(`${this.baseUrl}/get-all-applicants`).subscribe(
      (response) => {
        this.applicants = response;
      },
      error => {
        console.error('Error fetching applicants', error);
      }
    );
  }

  parseAndFormatMatchPercentage(value: string): string {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      return parsedValue.toFixed(2);
    } else {
      return 'N/A'; 
    }
  }statusUpdatedMessageVisible = false;


  updateStatus(email: string, status: string) {
    const requestData = {
      email: email,
      status: status
    };
  
    this.http.post(`${this.baseUrl}/update-status`, requestData).subscribe(
      (response: any) => {
        console.log('Status updated:', response);
  
        const updatedApplicant = this.applicants.find(applicant => applicant.email === email);
        if (updatedApplicant) {
          updatedApplicant.status = status;
        }
  
        this.statusUpdatedMessageVisible = true;
  
        setTimeout(() => {
          this.statusUpdatedMessageVisible = false;
        }, 2000);
      },
      error => {
        console.error('Error updating status', error);
      }
    );
  }
  
}
