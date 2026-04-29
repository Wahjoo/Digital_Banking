# NibssByPhoenix Digital Banking System API

A secure, functional backend banking system API built for a fintech startup. This system handles customer onboarding workflows integrated with NibssByPhoenix verification APIs, account management with automatic pre-funding, and core banking operations such as fund transfers and balance inquiries. Data privacy is strictly maintained through the isolation of customer records and transaction history.

## Features

- **Authentication & Authorization**: Secure user registration, login, and token-based authentication using JWT.
- **Customer Onboarding Workflow**:
  - BVN (Bank Verification Number) validation.
  - NIN (National Identity Number) validation.
  - Identity verification and insertion.
- **Account Management**: Automatic account pre-funding upon successful onboarding and synchronization.
- **Core Banking Operations**:
  - Fund transfers to internal and external accounts.
  - Real-time balance inquiries.
  - Name enquiries by account number.
  - Transaction history retrieval and status checking.
- **Security & Data Privacy**: Strict isolation of customer records and transaction data.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **External API Integration**: Axios (for communicating with NibssByPhoenix APIs)
- **Email Service**: Nodemailer

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas cluster)

## Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository_url>
   cd DigitalBankingSystem
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory and configure the following environment variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# NibssByPhoenix Configuration
NIBSS_API_KEY=your_nibss_api_key
NIBSS_API_SECRET=your_nibss_api_secret
NIBSS_BASE_URL=https://nibssbyphoenix.onrender.com/api

# Email Configuration
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
EMAIL_FROM=Sender Name <no-reply@yourdomain.com>
```

## Running the Server

- **Development Mode**:
  ```bash
  npm run dev
  ```
  This will start the server using `nodemon`, automatically restarting on file changes.

- **Production Mode**:
  ```bash
  npm start
  ```

The API will typically be accessible at `http://localhost:5000`.

## API Endpoints

### Authentication & Onboarding (`/api/auth`)
- `POST /register`: Register a new user
- `POST /login`: Authenticate an existing user
- `POST /onboard`: Trigger the onboarding flow (requires auth)
- `POST /validate-bvn`: Validate user BVN (requires auth)
- `POST /validate-nin`: Validate user NIN (requires auth)
- `POST /insert-identity`: Insert verified identity (requires auth)
- `POST /sync-account`: Sync created account (requires auth)
- `POST /nibss-auth`: Authenticate with NibssByPhoenix

### Banking Operations (`/api/banking` - all endpoints require auth)
- `GET /balance`: Retrieve account balance
- `GET /name-enquiry/:accountNumber`: Fetch account holder name by account number
- `POST /transfer`: Initiate a fund transfer
- `GET /history`: View transaction history
- `GET /status/:reference`: Check the status of a specific transaction
- `GET /accounts`: Get all accounts belonging to the authenticated user

## License

This project is licensed under the ISC License.
