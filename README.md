# Task Manager Project Setup

## Prerequisites

- Node.js (v18 or above recommended)
- npm or yarn
- A modern browser

## Installation

1. **Clone the repository:**

   ```sh
   git clone git@github.com/chukwudi34/task-manager.git
   cd task-manager
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Environment Variables:**

   - Copy `.env.example` to `.env` and fill in your environment variables:
     ```
     VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
     VITE_TASK_AMOUNT=50000
     ```

4. **Start the development server:**

   ```sh
   npm run dev
   ```

5. **Open in browser:**

   - Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

## Project Structure

- `/src/pages/taskManager/` - Main Task Manager components
- `/src/common/` - Reusable UI components
- `/src/services/` - API helpers and axios instance

## API

- Ensure your backend API is running and accessible at the configured endpoint.

## Payment

- The app uses Paystack for payments. Make sure your Paystack public key is set in `.env`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Support

For issues, open a GitHub issue or send an email to chukwudinwafor@gmail.com
