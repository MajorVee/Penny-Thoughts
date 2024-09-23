## Overview

Used Amplify UI component library to scaffold out an entire user authentication flow, allowing users to sign up, sign in, and reset their password with just few lines of code. Additionally, you will build an app frontend that allows users to create, update, and delete their notes. They will also be able to upload an image and associate it with a note.

## Features

- **Authentication**: Setup with Amazon Cognito for secure user authentication.
- **API**: Ready-to-use GraphQL endpoint with AWS AppSync.
- **Database**: Real-time database powered by Amazon DynamoDB.

Setup & Configurations
Create a new React app npx create-react-app my-notes-app
   
Install dependencies: Navigate to your project directory with cd my-notes-app command` and install AWS Amplify.

Amplify Configuration: Configure Amplify with your AWS account details. Create an aws-config.js file in your src directory with the following configuration, replacing the placeholders with your actual AWS settings.
  
Initialize Amplify after customize the .css

Setup Authentication using Cognito by logging in the site.
   
**GraphQL Setup: List Notes Query and Create & Delete Notes Mutations**

First, create a graphql directory in the src folder, and then add a client.js file inside it.

Next, let’s create a listNotes query to fetch all the notes.

To do this, add a queries.js file in the graphql directory.

Create a mutations.js file in the graphql directory to define these mutations.

**Create Notes UI and Integrate GraphQL Queries & Mutations**

**Test the Application**

We’re all set! Run the React app with the npm start


![0_oTFla168vkxDc_zR](https://github.com/user-attachments/assets/f94fb576-0b61-4838-992a-d5ad43b78a4b)
