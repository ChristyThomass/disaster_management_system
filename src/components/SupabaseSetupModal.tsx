import React, { useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SQL_SCHEMA } from '../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedPasswordSql, setCopiedPasswordSql] = useState(false);

  if (!isOpen) return null;

  const passwordSqlSnippet = `-- 1. Add password & photo columns to your users table
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Create or update user_profiles table safely
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'Civilian',
  district TEXT DEFAULT 'Wayanad',
  password TEXT,
  password_hash TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;`;

  const handleCopyAllSql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const handleCopyPasswordSql = () => {
    navigator.clipboard.writeText(passwordSqlSnippet);
    setCopiedPasswordSql(true);
    setTimeout(() => setCopiedPasswordSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border-t-4 border-[#10b981] animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#e6f4ea] text-[#137333] flex items-center justify-center shrink-0 font-bold text-lg">
              ⚡
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1a1c1c] flex items-center gap-2">
                Supabase Database Configuration
                <span className="bg-[#10b981] text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-full">
                  Active
                </span>
              </h3>
              <p className="text-xs text-[#5b403d]">Project ID: auazpiwbvsbzrccsqnyf</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Quick Password Column SQL Box */}
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3.5 mb-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <span className="material-symbols-outlined text-[18px] text-amber-700">key</span>
              Add Password Column to Users Table (SQL Command):
            </div>
            <button
              type="button"
              onClick={handleCopyPasswordSql}
              className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1 transition-all shadow-2xs"
            >
              <span className="material-symbols-outlined text-[13px]">content_copy</span>
              {copiedPasswordSql ? 'Copied Password SQL!' : 'Copy Password SQL'}
            </button>
          </div>
          <p className="text-[11px] text-amber-800">
            If your Supabase <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold">users</code> table was created without a password column, run this in the{' '}
            <a
              href="https://supabase.com/dashboard/project/auazpiwbvsbzrccsqnyf/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#af101a] underline font-bold"
            >
              Supabase SQL Editor
            </a>:
          </p>
          <pre className="bg-amber-950 text-amber-200 p-2 rounded text-[11px] font-mono select-all">
{passwordSqlSnippet}
          </pre>
        </div>

        {/* Credentials Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs space-y-1.5 mb-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-500">Supabase API URL:</span>
            <code className="text-[#005f7b] font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
              {SUPABASE_URL}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-500">Publishable Key:</span>
            <code className="text-gray-700 font-mono bg-white px-2 py-0.5 rounded border border-gray-200 truncate max-w-[280px]">
              {SUPABASE_ANON_KEY}
            </code>
          </div>
        </div>

        {/* SQL Full Schema helper */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-gray-700">
              Complete Supabase SQL Schema (All 6 Tables):
            </span>
            <button
              onClick={handleCopyAllSql}
              className="text-xs bg-[#10b981] hover:bg-[#059669] text-white px-3 py-1 rounded font-bold transition-all flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              {copiedAll ? 'Copied Full Script!' : 'Copy Full Schema'}
            </button>
          </div>
          <pre className="flex-1 bg-gray-900 text-emerald-400 p-3 rounded-lg text-[11px] font-mono overflow-auto leading-relaxed border border-gray-800">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs px-5 py-2 rounded transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
