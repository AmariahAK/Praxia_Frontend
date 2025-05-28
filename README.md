# Praxia Frontend

Praxia is an AI-powered healthcare assistant frontend developed with Next.js, TypeScript, and Tailwind CSS. This application provides a responsive and intuitive interface for interacting with the Praxia backend services.

## Features

- **Responsive Design**: Fully responsive UI that works on mobile, tablet, and desktop
- **Scroll Effects**: Dynamic scroll effects that highlight the current section
- **User Authentication**: Secure login and registration system
- **User Profiles**: Personalized health profiles with medical history
- **Symptom Analysis**: AI-powered diagnosis of medical symptoms
- **X-ray Analysis**: Upload and analyze X-ray images
- **Chat System**: Persistent chat sessions with the AI assistant
- **Multilingual Support**: Interface for English, French, and Spanish interactions
- **Medical Research**: Access to relevant medical research
- **Health News**: Latest health news from trusted sources

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios

## Getting Started

For detailed setup instructions, please refer to our [Setup Guide](guide/Setup.md).

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/AmariahAK/Praxia_Frontend.git
   cd praxia_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on the example in the [Setup Guide](guide/Setup.md).

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser to see the application.

## Project Structure

```
praxia_frontend/
├── public/               # Static files
├── src/
│   ├── api/              # API services
│   │   └── api.ts        # API service
│   ├── app/              # Next.js App Router
│   │   ├── auth/         # Authentication routes
│   │   │   ├── forgot_password/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── resend-verification/
│   │   │   ├── reset_password/
│   │   │   └── verify_email/
│   │   ├── chats/        # Chat functionality
│   │   │   ├── sessions/
│   │   │   └── page.tsx
│   │   ├── favicon.ico   # Site favicon
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # Reusable components
│   │   ├── auth/         # Authentication components
│   │   │   ├── Email_Verification/
│   │   │   ├── Forgot_Password/
│   │   │   ├── Login/
│   │   │   ├── Password_Changed/
│   │   │   ├── Register/
│   │   │   ├── Resend_Verification/
│   │   │   └── Reset_Password/
│   │   ├── chats/        # Chat components
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatSidebar.tsx
│   │   ├── layout/       # Layout components
│   │   │   └── AppLayout.tsx
│   │   └── user/         # User components
│   │       └── UserProfile.tsx
│   └── types/            # TypeScript type definitions
│       └── user.ts       # User type definitions
├── guide/                # Documentation
│   ├── Setup.md          # Setup instructions
│   └── LICENSE.md        # License information
├── eslint.config.mjs     # ESLint configuration
├── next-env.d.ts         # Next.js TypeScript declarations
├── next.config.ts        # Next.js configuration
├── postcss.config.mjs    # PostCSS configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies
├── package-lock.json     # Dependency lock file
└── README.md             # This file
```

## API Integration

The frontend integrates with the Praxia Backend API for all functionality. The API services are organized in the `src/api` directory and include:

- Authentication (register, login, logout)
- User Profile (get, update, confirm gender)
- Chat (sessions, messages)
- Medical Consultations
- X-ray Analysis
- Research Queries
- Health News

## Color Scheme

The application uses a clean and medical-friendly color scheme:

- **Primary**: Soft Blue (#4A90E2)
- **Secondary**: Mint Green (#2ECC71)
- **Base**: Clean White (#FFFFFF)
- **Neutral**: Light Gray (#F4F6F8)
- **Accent**: Blueish-Greenish (#40C4FF) (updated for healthcare vibe)
- **Text**: Dark Gray (#333333)
- **Secondary Text**: Medium Gray (#666666)

## Contributing to Praxia

Thank you for your interest in Praxia! While I appreciate the community's enthusiasm, this project is currently maintained as a personal portfolio project. I encourage developers to fork the repository and use it as inspiration for their own healthcare applications.

If you'd like to build upon Praxia's foundation, please feel free to:
- Fork the repository for your own projects
- Use the codebase as a learning resource
- Adapt the concepts for your own healthcare solutions

Please ensure any derivative works comply with the Praxia License, including not using the name "Praxia" for derivative works and crediting Amariah Kamau, as specified in [LICENSE.md](guide/LICENSE.md).

## License

This project is licensed under the Praxia License. See [LICENSE.md](guide/LICENSE.md) for details.

### Third-Party Licenses

Praxia uses the following open-source software:
- [Next.js](https://github.com/vercel/next.js) - MIT License
- [TypeScript](https://github.com/microsoft/TypeScript) - Apache 2.0 License
- [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) - MIT License
- [React](https://github.com/facebook/react) - MIT License

## Contact

- **Developer**: Amariah Kamau
- **LinkedIn**: [https://www.linkedin.com/in/amariah-kamau-3156412a6/](https://www.linkedin.com/in/amariah-kamau-3156412a6/)
- **GitHub**: [https://github.com/AmariahAK](https://github.com/AmariahAK)# Praxia_Frontend
