This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Features

### Vulnerability Scanner

The Vulnerability Scanner allows you to scan container images for known vulnerabilities using Trivy, a comprehensive open-source vulnerability scanner.

**Accessing the Scanner:**

*   Navigate to the **Vulnerability Scanner** page using the link in the main navigation bar (look for the Shield icon).
*   Alternatively, from the **Dashboard** page, under the "Workloads" tab, each listed container image has a **Scan** button (also with a Shield icon) that will take you directly to the scanner with the image name pre-filled.

**Using the Scanner:**

1.  If you navigated directly to the "Vulnerability Scanner" page, enter the full name of the container image you wish to scan into the input field (e.g., `alpine:latest`, `nginx:1.25`, `myimage:mytag`).
2.  Click the "Scan Image" button.
3.  If you clicked a "Scan" button from the Workloads list, the image name will be automatically filled in. You can then click "Scan Image".
4.  A loading indicator will appear while the scan is in progress.

**Interpreting the Results:**

*   Once the scan is complete, the results will be displayed in a table.
*   If no vulnerabilities are found for the image, a message "No vulnerabilities found for this image." will be shown.
*   The results table includes the following columns:
    *   **ID:** The official identifier of the vulnerability (e.g., `CVE-2023-XXXXX`).
    *   **Severity:** The severity level of the vulnerability (e.g., `HIGH`, `MEDIUM`, `LOW`, `CRITICAL`, `UNKNOWN`).
    *   **Package Name:** The name of the OS or application package that contains the vulnerability.
    *   **Installed Version:** The version of the package currently installed in the image.
    *   **Fixed Version:** The version of the package in which the vulnerability is fixed (if a fix is available).
    *   **Title/Description:** A brief description of the vulnerability.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
