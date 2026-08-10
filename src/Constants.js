// export const DELI_API_ROOT = "https://deliprojectapi20260103121810-ehf5hne8cbeucwaz.canadacentral-01.azurewebsites.net"
// export const DELI_API_ROOT = "https://localhost:44334" // old ASP.NET API — kept here in case of rollback

// import.meta.env.PROD is a Vite built-in: true in a production build
// (`npm run build`, which is what the Firebase Hosting GitHub Action runs),
// false in the dev server (`npm run client`). So local dev keeps talking to
// your own machine's server/, while the deployed site talks to the real
// Render-hosted API — no manual toggling needed between the two.
export const DELI_API_ROOT = import.meta.env.PROD
    ? "https://square-deli-api.onrender.com"
    : "http://localhost:5000"