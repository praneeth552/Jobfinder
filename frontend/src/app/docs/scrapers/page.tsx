import React from "react";

export default function DocsScrapers() {
  return (
    <div className="space-y-8 text-[--foreground]/80 font-[sans-serif]">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-[--foreground] mb-4">
          Scrapers & Legal Guidelines
        </h1>
        <p className="text-lg leading-relaxed text-[--foreground]/90">
          Understanding the data aggregation layer of Tackleit and practicing responsible, legal web scraping.
        </p>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8 text-yellow-600 dark:text-yellow-400">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          ⚠️ Important Disclaimer
        </h2>
        <p className="leading-relaxed text-sm">
          The scrapers provided in this project are strictly for educational and demonstrative purposes. By making this project open-source, we are sharing the structural logic, but we do <strong>not</strong> endorse the reckless public exposure or mass-abuse of private company APIs.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[--foreground] border-b border-[--border] pb-2 mb-4">
          Extending the Platform
        </h2>
        <p className="leading-relaxed">
          Tackleit's architecture is highly modular. You can easily add your own scraper files for new job boards or company websites by writing python scripts inside the `scraper/` directory.
        </p>
        <p className="leading-relaxed">
          While we encourage developers to contribute and extend this list, please ensure that you respect the target website's architecture.
        </p>
      </div>

      <div className="space-y-6 mt-12 bg-[--card-background] p-6 rounded-xl border border-[--border]">
        <h2 className="text-xl font-bold text-[--foreground] mb-4">
          Legal Boundaries & Rate Limiting
        </h2>
        
        <ul className="list-disc pl-6 space-y-4">
          <li>
            <strong className="text-[--foreground]">Respect `robots.txt`:</strong> Always check a company's `robots.txt` file before initiating an automated scrape. If crawling is disallowed, do not proceed.
          </li>
          <li>
            <strong className="text-[--foreground]">Internal APIs:</strong> Many modern websites power their frontends with internal JSON APIs. While these are technically accessible, exposing these internal APIs publicly through a commercialized open-source tool without authorization is legally ambiguous and highly discouraged.
          </li>
          <li>
            <strong className="text-[--foreground]">Implement Rate Limiting:</strong> Never bombard a company's server. Always implement sleep timers (`time.sleep()`), randomize your requests, and keep the concurrency to an absolute minimum so you do not impact their infrastructure.
          </li>
          <li>
            <strong className="text-[--foreground]">Commercial Abuse:</strong> If you intend to use Tackleit's scrapers to power a massive commercial aggregator, be aware that you may face IP bans or legal cease and desist actions from the source companies. Proceed with caution and consult legal counsel.
          </li>
        </ul>
      </div>

    </div>
  );
}
