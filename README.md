# 9sharti

9sharti is a dynamic e-commerce website for a small fish-selling business. The project is designed to give customers a simple way to browse available fish, learn about products, and place orders online while providing the business with a foundation for managing its products and orders.

## Project goal

Build a modern, responsive web experience that supports:

- Fish product browsing and product details
- Dynamic product and order data
- Customer ordering workflows
- Business administration features
- Smooth, engaging page animations

## Technology stack

- **Angular 21** - frontend framework and application structure
- **Firebase** - planned backend services, data storage, and authentication integration
- **GSAP** - interface animations and transitions
- **Tailwind CSS** - responsive utility-first styling
- **Angular SSR** - server-side rendering support

## Getting started

### Prerequisites

- Node.js
- npm 11 or compatible npm version

### Installation

Clone the repository, install dependencies, and start the development server:

```bash
npm install
npm start
```

Open `http://localhost:4200/` in a browser. The application reloads automatically when source files change.

## Available commands

| Command                     | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `npm start`                 | Start the local development server               |
| `npm run build`             | Create a production build in `dist/`             |
| `npm run watch`             | Build in development mode and rebuild on changes |
| `npm test`                  | Run the unit test suite with Vitest              |
| `npm run serve:ssr:9sharti` | Serve the generated SSR build                    |

## Project structure

```text
src/
	app/
		admin/     Administrative features
		home/      Home and product discovery experience
		order/     Customer ordering experience
	assets/      Application assets
	styles.css   Global styles
public/        Static public assets
```

## Firebase configuration

Firebase configuration should be added through the project environment configuration before connecting the application to production Firebase services. Keep API keys and project-specific settings out of committed source files when possible, and use separate Firebase projects or configurations for development and production.

## Development notes

Use Angular CLI commands to generate new application code:

```bash
ng generate component component-name
```

For more information, see the [Angular CLI documentation](https://angular.dev/tools/cli).
