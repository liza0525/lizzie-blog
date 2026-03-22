"use client";

// 캐시 수동 무효화 관리 페이지
// /api/revalidate 엔드포인트를 UI로 호출 — 시크릿 토큰 + 슬러그 입력

import { useState } from "react";

type Status = { ok: boolean; message: string } | null;

export default function AdminPage(): React.JSX.Element {
  const [token, setToken] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(
        `/api/revalidate?token=${encodeURIComponent(token)}&slug=${encodeURIComponent(slug)}`
      );
      const data = await res.json() as { revalidated?: boolean; error?: string; message?: string };

      if (res.ok && data.revalidated) {
        setStatus({ ok: true, message: `✓ "${slug}" 캐시가 무효화됐어요.` });
      } else {
        setStatus({ ok: false, message: data.error ?? data.message ?? "알 수 없는 오류" });
      }
    } catch {
      setStatus({ ok: false, message: "요청 중 오류가 발생했어요." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-xl font-semibold mb-8">캐시 무효화</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="token" className="text-sm text-gray-500 dark:text-gray-400">
            시크릿 토큰
          </label>
          <input
            id="token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            placeholder="REVALIDATE_SECRET"
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="slug" className="text-sm text-gray-500 dark:text-gray-400">
            슬러그
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            placeholder="my-post-slug"
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {loading ? "처리 중..." : "캐시 무효화"}
        </button>
      </form>

      {status && (
        <p className={`mt-6 text-sm ${status.ok ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}
