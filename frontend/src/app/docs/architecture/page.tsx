import React from "react";
import Image from "next/image";

export default function DocsArchitecture() {
  return (
    <div className="space-y-8 text-[--foreground]/80 font-[sans-serif]">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-[--foreground] mb-4">
          Tech Stack & Architecture
        </h1>
        <p className="text-lg leading-relaxed text-[--foreground]/90">
          This project is built with a modern, robust, and scalable tech stack, deployed entirely on AWS for production.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[--foreground] border-b border-[--border] pb-2 mb-6">
          Technologies
        </h2>
        <div className="overflow-x-auto border border-[--border] rounded-xl bg-[--card-background]/50">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-[--border]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[--foreground] bg-[--foreground]/5 w-1/4">Frontend</th>
                <td className="px-6 py-4">Next.js, React, TypeScript, Tailwind CSS, Framer Motion, axios, js-cookie</td>
              </tr>
              <tr>
                <th className="px-6 py-4 font-semibold text-[--foreground] bg-[--foreground]/5">Backend</th>
                <td className="px-6 py-4">FastAPI, Python, Motor, Pydantic, python-jose, passlib, google-generativeai, Razorpay SDK</td>
              </tr>
              <tr>
                <th className="px-6 py-4 font-semibold text-[--foreground] bg-[--foreground]/5">Database</th>
                <td className="px-6 py-4">MongoDB Atlas</td>
              </tr>
              <tr>
                <th className="px-6 py-4 font-semibold text-[--foreground] bg-[--foreground]/5">Deployment</th>
                <td className="px-6 py-4">AWS Amplify (Frontend), AWS ECR, AWS API Gateway, AWS Lambda (Backend), Docker, GitHub Actions (CI/CD)</td>
              </tr>
              <tr>
                <th className="px-6 py-4 font-semibold text-[--foreground] bg-[--foreground]/5">Scrapers</th>
                <td className="px-6 py-4">Python, BeautifulSoup, requests</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-[--foreground] border-b border-[--border] pb-2 mb-6">
          Deployment Architecture
        </h2>
        <ul className="list-disc pl-6 space-y-4 text-[--foreground]/90">
          <li>
            <strong className="text-[--foreground]">Frontend:</strong> The Next.js application is deployed and hosted on <strong>AWS Amplify</strong>, providing a CI/CD pipeline that automatically builds and deploys the site on every push.
          </li>
          <li>
            <strong className="text-[--foreground]">Backend:</strong> The FastAPI backend is containerized using <strong>Docker</strong>. A manual-trigger <strong>GitHub Actions</strong> workflow builds the Docker image, pushes it to the <strong>AWS Elastic Container Registry (ECR)</strong>, and then deploys it as an <strong>AWS Lambda</strong> function via an <strong>AWS API Gateway</strong>.
          </li>
          <li>
            <strong className="text-[--foreground]">Domain:</strong> The production domain (`tackleit.xyz`) is registered and managed via <strong>Hostinger</strong>.
          </li>
          <li>
            <strong className="text-[--foreground]">Automated Scraping:</strong> A scheduled <strong>GitHub Actions</strong> workflow runs weekly to execute the Python web scrapers, ensuring the job database remains fresh.
          </li>
        </ul>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-[--foreground] border-b border-[--border] pb-2 mb-6">
          Architecture Diagram
        </h2>
        <div className="bg-white/5 p-4 rounded-xl border border-[--border] flex justify-center mt-6 shadow-xl relative w-full aspect-video">
          <Image
            src="/Gemini_Generated_Image_mpyuxympyuxympyu.png"
            alt="Tackleit Architecture"
            fill
            className="object-contain rounded-lg"
          />
        </div>
        <p className="text-sm mt-4 text-[--foreground]/60 italic text-center">
          The diagram above illustrates the complete end-to-end architecture of Tackleit.
        </p>
      </div>
    </div>
  );
}
