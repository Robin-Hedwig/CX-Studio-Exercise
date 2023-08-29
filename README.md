# CX-Studio-Exercise
CX Studio technical exercise

# Progress and Challenges 

1)As the first step of learning, I practiced creating a sample CDK project as given in the CDK workshop. I learned to create L1, L2, and L3 constructs and lambda functions using the CDK project. (25/08/2023)
2)Worked on the idea and designed an overview of the system design of the application that I am going to develop using CDK. (26/08/2023)
3)Finished the file upload service, wrote a few unit tests, and did manual testing on uploading the file using the endpoint generated and Postman. Also, I created the first page of the UI for the application using Angular to make it interesting. (27/08/2023)
4)Once the file upload is done, the next lambda to parse the resume should be triggered. I am facing a lot of issues in parsing the resume. I just need to convert the data from the PDF file to a string and store it in the resume column. I tried using pdf-parse, but I think the issue is with the compression type of the PDF, so it is not extracting the data. I tried with pdfjs-dist; the lambda is working fine, but the extracted data is empty when using this. Now, I am exploring alternate options to parse the resume. (28/08/2023)
5)I m using AWS Textract to read pdf pages/png images, it is reading pages but final text is empty, i am trying to find the issue here. I found that issue is with my pdf, I directly uploaded pdf file and png to aws textract console, pdf is not giving any readable texts , but png is giving. My code also does the same, lambda is triggering fine and png is getting parsed when directly uploaded to S3 but during manual testing using postman, it fails due to some content type issue, I have to fix that and write some unit tests for this lambda. (29/08/23)

# To run the application
npm run build
cdk bootstrap
cdk deploy

# packages to install


after deploying, you can use the UI created to access the services created (check endpoints before testing)
cdk destroy--> to destroy resources once completed