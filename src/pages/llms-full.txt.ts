import { llmsFiles } from '../lib/llms';
export const GET = () => new Response(llmsFiles().full, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
