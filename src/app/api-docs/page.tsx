import { ApiDocsClient } from "./ApiDocsClient";
import { TryOnImageUploadPanel } from "./TryOnImageUploadPanel";

export const metadata = {
  title: "API Docs — AI Outfit Changer",
  robots: { index: false, follow: false },
};

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">API Swagger — v1</h1>
        <p className="mt-1 text-sm text-gray-600">
          Production server: <code className="text-xs">https://appworkspro.com/api/v1</code> — use{" "}
          <strong>Authorize</strong> with Bearer token from Login.
        </p>
      </div>
      <TryOnImageUploadPanel />
      <ApiDocsClient />
    </main>
  );
}
