# TackleIt: AI-Powered Job Finder

TackleIt is a modern web application that leverages AI to provide users with personalized job recommendations. It features a FastAPI backend, a Next.js frontend, and a suite of powerful features designed to streamline the job search process.

## ✨ Features

- **AI-Powered Recommendations:** Utilizes Google's Gemini AI to generate job recommendations based on user preferences.
- **User Authentication:** Secure user authentication with JWT, including standard email/password and Google Sign-In.
- **Personalized Preferences:** Users can set and update their job preferences, including roles, technologies, location, and salary expectations.
- **Free vs. Pro Tiers:** Offers different service levels, with Pro users gaining access to premium features.
- **Google Sheets Integration:** Pro users can export their job recommendations to a Google Sheet.
- **Payment Integration:** Seamless payments with Razorpay for upgrading to the Pro tier.
- **Contact Form:** A functional contact form for user inquiries.
- **Web Scrapers:** A collection of Python scripts to scrape job data from various sources.

## 🚀 Tech Stack

**Frontend:**
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [axios](https://axios-http.com/)
- [Google API Client for JavaScript](https://github.com/google/google-api-javascript-client)

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/)
- [Python](https://www.python.org/)
- [MongoDB](https://www.mongodb.com/) (with `motor` and `pymongo`)
- [Google Generative AI](https://ai.google.dev/)
- [Razorpay](https://razorpay.com/)
- [Passlib](https://passlib.readthedocs.io/en/stable/) (for password hashing)
- [python-jose](https://python-jose.readthedocs.io/en/latest/) (for JWT)

**Database:**
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 📂 Folder Structure

```
Tackleit/
├── backend/            # FastAPI backend
├── frontend/           # Next.js frontend
├── scraper/            # Job scraping scripts
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or later)
- [Python](https://www.python.org/downloads/) (v3.9 or later)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saipraneethkotyada/Tackleit.git
   cd Tackleit
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   ```
   - Fill in the required environment variables in `.env.local`.

3. **Backend Setup:**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   cp .env.example .env
   ```
   - Fill in the required environment variables in `.env`.

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## 📝 API Endpoints

The backend exposes the following API endpoints:

- `/auth`: User authentication (login, signup, Google Sign-In)
- `/jobs`: Job listings
- `/preferences`: User job preferences
- `/recommendations`: AI-powered job recommendations
- `/sheets`: Google Sheets integration
- `/user`: User profile management
- `/contact`: Contact form
- `/payment`: Razorpay payment integration

For detailed information on each endpoint, please refer to the backend source code.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
