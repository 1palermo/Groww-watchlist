'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

export default function SignupPage() {
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const supabase = getSupabase(); if (!supabase) { setMessage('Supabase is not configured; local mock mode is active.'); return; } const { error } = await supabase.auth.signUp({ email: String(form.get('email')), password: String(form.get('password')) }); setMessage(error?.message || 'Check your email to confirm your account.'); }
  return <main className="flex min-h-screen items-center justify-center bg-[#f4f6f1] px-6"><form onSubmit={submit} className="w-full max-w-sm space-y-5 border border-slate-200 bg-white p-8 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Groww Pulse</p><h1 className="text-3xl font-black">Start tracking</h1><input name="email" required type="email" placeholder="Email" className="w-full border p-3" /><input name="password" required type="password" placeholder="Password" className="w-full border p-3" /><button className="w-full bg-slate-950 p-3 font-bold text-white">Sign up</button>{message && <p className="text-sm text-emerald-700">{message}</p>}<p className="text-sm text-slate-500">Already have an account? <Link className="text-emerald-700" href="/login">Log in</Link></p></form></main>;
}
