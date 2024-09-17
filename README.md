# Git Commit Analyzer

This project is a Git Commit Analyzer that allows you to visualize git commit statistics using an interactive dashboard. The application is built using Remix, Cloudflare Pages, and incorporates Chart.js for visualization.

## Features

- **Git Log Parsing**: Extract commit data from a git log file.
- **Chart Visualization**: Visualize commit metrics, including insertions, deletions, and commit frequencies by various dimensions like author, date, and time.
- **Responsive Interface**: Built with React and Tailwind CSS for a smooth user experience on all devices.
- **Cloudflare Integration**: Deploy seamlessly to Cloudflare Pages.

## Technologies Used

- **[Remix](https://remix.run/)**: React framework for full-stack applications.
- **[Cloudflare](https://www.cloudflare.com/)**: Used for deployment via Cloudflare Pages.
- **[Chart.js](https://www.chartjs.org/)**: Used for rendering visual charts.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework for styling.
- **TypeScript**: Ensures type safety across the application.
- **ESLint**: Code quality and consistency enforcement.

## Getting Started

### Prerequisites

- **Node.js v20.x.x** or above (see `.nvmrc` for the version).
- **npm** for managing dependencies.

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/minagishl/git-commit-analyzer.git
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

   This will start a local development server.

### Using the Git Commit Analyzer

1. Obtain the git log from your repository by running:

   ```bash
   git log --numstat --date=iso-strict > gitlog.txt
   ```

2. Copy the content of the `gitlog.txt` file and paste it into the text area in the web application.
3. Click on "Analyze" to visualize the commit data.

### Building for Production

1. Build the project for production:

   ```bash
   npm run build
   ```

2. Deploy to Cloudflare Pages:

   ```bash
   npm run deploy
   ```

### Type Generation for Cloudflare Bindings

If you modify `wrangler.toml`, regenerate the Cloudflare types:

```bash
npm run typegen
```

## Linting and Type Checking

- To check for lint errors:

  ```bash
  npm run lint
  ```

- To check for TypeScript type errors:

  ```bash
  npm run typecheck
  ```

## Project Structure

- **`app/`**: Contains all the front-end React components and route logic.
- **`public/`**: Contains static assets like icons and images.
- **`functions/`**: Contains the Cloudflare Pages functions.
- **`tailwind.config.ts`**: Configuration file for Tailwind CSS.
- **`tsconfig.json`**: TypeScript configuration.
- **`wrangler.toml`**: Configuration file for Cloudflare Workers.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
