# Praxia Frontend Setup Guide

This guide explains how to set up and configure the Praxia Frontend application for development.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Development Setup](#development-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up the Praxia Frontend, ensure you have the following installed:

- Node.js 18 or later
- npm or yarn
- Git
- Access to the Praxia Backend API (running locally or deployed)

## Environment Configuration

The application uses environment variables for configuration. Create a `.env.local` file in the project root for development.

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API URL for your backend | `http://localhost:8000/api` |

### Example `.env.local`

```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Note**: Replace the API URL with your actual backend endpoint. If you're running the Praxia Backend locally, use `http://localhost:8000/api`. For a deployed backend, use your production API URL.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AmariahAK/Praxia_Frontend.git
   cd praxia_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on the example above:
   ```bash
   touch .env.local
   ```
   
   Then add your environment variables to the file.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser to see the application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## Troubleshooting

### Common Issues

#### Backend Connection Errors
If the frontend cannot connect to the backend:
- Verify `NEXT_PUBLIC_API_URL` in your `.env.local` file is correct
- Ensure the backend is running and accessible at the specified URL
- Check that there are no CORS issues between frontend and backend
- Test the API endpoint directly in your browser or with a tool like Postman

#### Environment Variables Not Loading
If environment variables aren't being recognized:
- Ensure your `.env.local` file is in the project root directory
- Restart the development server after making changes to `.env.local`
- Verify variable names start with `NEXT_PUBLIC_` for client-side access
- Check that there are no syntax errors in your `.env.local` file

#### Port Already in Use
If port 3000 is already in use:
- Stop any other applications running on port 3000
- Or specify a different port:
  ```bash
  npm run dev -- -p 3001
  ```

#### Node.js Version Issues
If you encounter Node.js compatibility issues:
- Ensure you're using Node.js 18 or later
- Consider using a Node.js version manager like nvm:
  ```bash
  nvm install 18
  nvm use 18
  ```

### Getting Help

If you encounter issues not covered here:
1. Check the browser console for error messages
2. Review the terminal output for build errors
3. Ensure your backend API is running and accessible
4. Verify all environment variables are correctly set

### Development Tips

- Use the browser's developer tools to inspect network requests to the API
- The application will automatically reload when you make changes to the code
- Check the Next.js documentation for additional configuration options
- Use TypeScript's type checking to catch errors early in development

---

[← Back to Main README](../README.md)