# Valkyria Frontend 🛡️🎸

Valkyria Frontend is a modern web application built with **Angular 21** designed to manage the complete experience of a music festival. The platform allows users to explore the artist lineup, manage ticket purchases, and view event details through an optimized and reactive interface.

## 🚀 Key Features

* **Lineup & Artist Management**: Full listing of artists with individual detailed views.
* **Integrated Purchase System**: A complete payment flow including ticket selection, checkout, and status management (success/cancel).
* **User Authentication**: Registration, login, and account confirmation for a personalized experience.
* **Profile & Orders**: Dedicated personal area for users to consult their order history.
* **Dynamic Interface**: Modular landing page featuring Hero, Tickets, Experience, Social, and Sponsors sections.
* **Splash Screen**: Animated loading screen with smooth fade-out effects for an enhanced initial user experience.

## 🛠️ Tech Stack

* **Framework**: [Angular 21.0.0](https://angular.dev/).
* **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) and PostCSS for a modern, utility-first design.
* **Icons**: FontAwesome 7.1 and Bootstrap Icons.
* **Testing**: [Vitest](https://vitest.dev/) for fast and efficient unit testing.
* **Package Manager**: npm 11.7.0.

## 📁 Project Structure

The project follows a modular architecture scalable by feature:

```text
src/app/
├── core/           # Global services, models, and interceptors.
├── features/       # Main functional modules:
│   ├── artists/    # Artist listing and details.
│   ├── auth/       # Login, registration, and confirmation.
│   ├── home/       # Landing page components.
│   ├── purchase/   # Purchase logic and checkout.
│   └── profile/    # User profile and order management.
├── layout/         # Structural components (Header, Footer, MainLayout).
└── shared/         # Utilities and reusable components.
```

## 💻 Development Guide

This guide provides instructions for setting up the environment, running the development server, and building the project.

---

### Prerequisites

Ensure you have the following installed on your local machine:

* **Node.js** (Latest LTS version recommended)
* **Angular CLI** (Version 21.0.4 or higher)

---

## 🛠️ Getting Started

### Installation

1. **Clone the repository** to your local machine.
2. **Install dependencies** using npm:

```bash
npm install
```

### Development Server

To run the application locally for development:

```bash
ng serve
```

Navigate to http://localhost:4200/. The application will automatically reload if you change any of the source files.

## 🏗️ Production & Testing

### Building

To compile the project for production environments:

```bash
ng build
```

The build artifacts will be stored in the dist/ directory.

### Testing

Run the unit test suite with Vitest:
Bash

```bash
ng test
```

## 📜 Available Scripts

Below is a list of common scripts defined in the `package.json`:

| Command         | Description                                           |
|:----------------|:------------------------------------------------------|
| `npm run start` | Starts the development server using `ng serve`.       |
| `npm run build` | Builds the application for production.                |
| `npm run watch` | Builds in development mode with active file watching. |
| `npm run test`  | Executes the unit test suite.                         |

Note: This project was generated with Angular CLI version 21.0.4.
