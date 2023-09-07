import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  //update base url here(note: do not finish the url with "/")
  private baseUrl = 'https://fih439y1u7.execute-api.eu-west-2.amazonaws.com/prod';

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
  }

}
