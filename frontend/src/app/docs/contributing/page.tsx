import React from "react";

export default function DocsContributing() {
  return (
    <div className="space-y-8 text-[--foreground]/80 font-[sans-serif]">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-[--foreground] mb-4">
          Contributing to Tackleit
        </h1>
        <p className="text-lg leading-relaxed text-[--foreground]/90">
          We welcome contributions! Whether you're fixing bugs, adding new scrapers, or improving the documentation, your help is appreciated.
        </p>
      </div>

      <div className="space-y-6 mt-8">
        <h2 className="text-2xl font-bold text-[--foreground] border-b border-[--border] pb-2 mb-4">
          Getting Started: Fork, Don't Clone
        </h2>
        <p className="leading-relaxed">
          If you plan on making modifications and contributing back, please <strong>Fork</strong> the repository on GitHub rather than just cloning it.
        </p>
        <div className="bg-[--primary]/5 border border-[--primary]/20 rounded-xl p-6 my-4">
          <p className="text-sm font-medium">
            Forking creates a complete copy of the repository in your own GitHub account. This allows you to freely experiment and push changes without needing write access to the original Tackleit repository. Once you're ready, you can submit a Pull Request from your fork.
          </p>
        </div>
      </div>

      <div className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-[--foreground] border-b border-[--border] pb-2 mb-4">
          Pull Request Protocol
        </h2>
        
        <ol className="list-decimal list-inside space-y-4 marker:text-[--primary] marker:font-bold">
          <li className="pl-2">
            <strong className="text-[--foreground]">Create a Feature Branch:</strong> Always create a new branch in your fork (`git checkout -b feature/your-feature-name`). Do not make changes directly to the `main` branch.
          </li>
          <li className="pl-2">
            <strong className="text-[--foreground]">Keep it Focused:</strong> Ensure your Pull Request addresses a single bug or adds a single feature. Do not bundle unrelated changes together.
          </li>
          <li className="pl-2">
            <strong className="text-[--foreground]">Sync the Backend:</strong> If you modify anything in the standard `/backend`, you <strong>must</strong> duplicate those changes to the `/aws-serverless/backend` to ensure deployments do not break.
          </li>
          <li className="pl-2">
            <strong className="text-[--foreground]">Test Locally:</strong> Ensure that both the FastAPI backend and Next.js frontend boot up without errors before submitting.
          </li>
          <li className="pl-2">
            <strong className="text-[--foreground]">Provide Context:</strong> When submitting the PR on GitHub, fill out the description thoroughly. Explain <em>why</em> you are making the change and <em>how</em> to test it.
          </li>
        </ol>
      </div>

      <div className="space-y-6 mt-12 bg-[--card-background] p-6 rounded-xl border border-[--border]">
        <h2 className="text-xl font-bold text-[--foreground] mb-4">
          Attribution & Credits
        </h2>
        <p className="leading-relaxed">
          Tackleit is an open-source labor of love. If you use our codebase, discuss it in articles, or host a commercialized fork of it, we kindly ask that you provide credit back to the original author.
        </p>
        <p className="leading-relaxed mt-2">
          <strong>Please include a link back to the GitHub repository:</strong><br />
          <a href="https://github.com/praneeth552/Jobfinder" target="_blank" rel="noopener noreferrer" className="text-[--primary] hover:underline">
            https://github.com/praneeth552/Jobfinder
          </a>
        </p>
      </div>

    </div>
  );
}
