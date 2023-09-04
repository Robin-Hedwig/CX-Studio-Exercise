# CX-Studio-Exercise
CX Studio technical exercise

# Project: Applicant Tracking System

# Progress and Challenges 

1)As the first step of learning, I practiced creating a sample CDK project as given in the CDK workshop.  (25/08/2023)

2)Worked on the idea and designed an overview of the system design of the application that I am going to develop using CDK. (26/08/2023)

3)Finished the file upload service, wrote a few unit tests, and did manual testing on uploading the file using the endpoint generated and Postman. Also, I created the first page of the UI for the application using Angular to make it interesting. (27/08/2023)

4)Once the file upload is done, the next lambda to parse the resume should be triggered. I am facing a lot of issues in parsing the resume. I just need to convert the data from the PDF file to a string and store it in the resume column. I tried using pdf-parse, but I think the issue is with the compression type of the PDF, so it is not extracting the data. I tried with pdfjs-dist; the lambda is working fine, but the extracted data is empty when using this. Now, I am exploring alternate options to parse the resume. (28/08/2023)

5)I m using AWS Textract to read pdf files/png/jpeg images, it is reading pages but final text is empty, i am trying to find the issue here. I found that issue is with my pdf, I directly uploaded pdf file and png to aws textract console, pdf is not giving any readable texts , but png is giving. My code also does the same, lambda is triggering fine and png is getting parsed when directly uploaded to S3 but during manual testing using postman, it fails due to some content type issue, the png image once uploaded via postman changes to unsupported format, I have to fix that and write some unit tests for this lambda. (29/08/23)

6) Completed File processing lambda, It will read the text from resume(pdf /png) and store it in resume column of dynamo db table. I made a minor mistake while uploading the data, i forgot to mention binary data type as multipart/form-data which caused the file to be in unsupported format. Created a get-count lambda to get number of applicants for the job( to display near the job like "25 people has applied for the job") (30/08/23)

7)Created a new lambda function to get all the applicants details to display in the admin page for admin to view the details of the applicants.(admin page) (31/08/23)

8)Created a new lambda function to update Status of applicants. (admin page) (1/09/23)

9)added lambda functions to vpc to make it available for multiple AZ (highly available and redundant). I have also created a new lambda function to find match percentage of each applicant for the job, admin will submit the keywords they are looking for in a candidate for a particular job role, and this lambda will find the match percentage of candidate matching the keywords with the resume stored in dynamo db table. (02/09/2023)

# To run the application, run both Backend(cdk) and UI
# CX-STUDIO-EXERCISE/cx-cdk-exercise
1)npm install (run this command inside main folder, then navigate to lambda folder and do the same)
2)npm run build
3)npm run test
4)cdk bootstrap
5)cdk deploy

after deploying backend
# CX-STUDIO-EXERCISE/UI/cx-exercise-ui

1)Change the base URL in 2 files( copy and paste the apigateway endpoint from terminal after deploying backend)
    a)home.component.ts
    b)admin.component.ts
2)npm install
3)ng serve

Open the web browser and paste following 2 urls in 2 different tabs(change port if run on diff port)
1)http://localhost:4200/           ----->this to apply for Job
2)http://localhost:4200/admin      ----->this is admin page

# If you do not want to use UI for testing, Use POSTMAN to test the services, (POSTMAN collection attached)

cdk destroy--> to destroy resources once completed