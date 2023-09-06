import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private baseUrl = 'https://jhnhex7cxc.execute-api.eu-west-2.amazonaws.com/prod';

  newKeyword = '';
  keywords = '';
  applicants: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getApplicants();
  }

  addKeyword() {
    if (this.newKeyword) {
      if (this.keywords) {
        this.keywords += ', ' + this.newKeyword;
      } else {
        this.keywords = this.newKeyword;
      }
      this.newKeyword = '';
    }
  }

  matchKeywords() {
    // Perform keyword matching here
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
  
}
