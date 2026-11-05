import type { APIRoute } from 'astro';
import { LOCALES } from '../../config';
import { buildSearchIndex } from '../../lib/searchIndex';

export function getStaticPaths() {
  return LOCALES.map(l => ({ params: { lang: l.code } }));
}

export const GET: APIRoute = ({ params }) => new Response(JSON.stringify(buildSearchIndex(params.lang as string)), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
