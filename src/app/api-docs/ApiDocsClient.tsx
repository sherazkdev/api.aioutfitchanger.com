"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    SwaggerUIBundle?: {
      (config: Record<string, unknown>): void;
      presets: { apis: unknown };
    };
    SwaggerUIStandalonePreset?: unknown;
  }
}

const SWAGGER_CSS = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css";
const SWAGGER_BUNDLE = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js";
const SWAGGER_STANDALONE = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s);
  });
}

function loadStylesheet(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

export function ApiDocsClient() {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    loadStylesheet(SWAGGER_CSS);
    void (async () => {
      await loadScript(SWAGGER_BUNDLE);
      await loadScript(SWAGGER_STANDALONE);
      const SwaggerUIBundle = window.SwaggerUIBundle;
      if (!SwaggerUIBundle) return;

      const specUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/api/v1/openapi`
          : "/api/v1/openapi";

      const standalone = window.SwaggerUIStandalonePreset;
      SwaggerUIBundle({
        url: specUrl,
        dom_id: "#swagger-ui",
        deepLinking: true,
        persistAuthorization: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
        presets: [SwaggerUIBundle.presets.apis, standalone].filter(Boolean),
        layout: standalone ? "StandaloneLayout" : undefined,
      });
    })();
  }, []);

  return <div id="swagger-ui" className="min-h-[calc(100vh-80px)]" />;
}
