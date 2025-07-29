'use client';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile: any;
  }
}

export default function TurnstileWidget({ onVerify }: { onVerify: (token:string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    const SCRIPT_ID = 'turnstile-script';

    const render = () => {
      if (ref.current && window.turnstile) {
        const id = window.turnstile.render(ref.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
          callback: onVerify,
        });
        widgetId.current = id;
      }
    };

    const loadScript = () => {
      if (document.getElementById(SCRIPT_ID)) {
        render();
        return;
      }
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.head.appendChild(script);
    };

    loadScript();

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, [onVerify]);

  return <div ref={ref} className="my-4" />;
}
