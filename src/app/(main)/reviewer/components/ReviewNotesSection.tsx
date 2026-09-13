"use client";

import React, { useState } from "react";
import { Lock, Save, Clock, UserCheck } from "lucide-react";
import { ReviewNote } from "../types";

interface ReviewNotesSectionProps {
  notes: ReviewNote[];
  onAddNote: (noteText: string) => void;
}

export default function ReviewNotesSection({
  notes,
  onAddNote,
}: ReviewNotesSectionProps) {
  const [newNote, setNewNote] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(newNote.trim());
    setNewNote("");
  };

  return (
    <div className="bg-[#FFFDF5] rounded-xl border border-[#FDE68A] p-4 space-y-3">
      {/* Header with Distinct Internal Banner */}
      <div className="flex items-center justify-between border-b border-[#FDE68A] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#FEF3C7] text-[#92400E]">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#78350F] uppercase tracking-wider">
              Internal Review Notes
            </h4>
            <span className="text-[10px] text-[#92400E]">
              Confidential — Visible to Reviewers and Legal Metrology Officers only
            </span>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]">
          {notes.length} {notes.length === 1 ? "Note" : "Notes"}
        </span>
      </div>

      {/* Existing Notes List */}
      <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
        {notes.length === 0 ? (
          <p className="text-xs text-[#92400E]/70 italic py-2">
            No internal review notes recorded for this case yet.
          </p>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="bg-white/90 rounded-lg p-3 border border-[#FDE68A] shadow-2xs space-y-1 text-xs"
            >
              <div className="flex items-center justify-between text-[11px] text-[#78350F] pb-1 border-b border-[#FDE68A]/60">
                <div className="flex items-center gap-1.5 font-semibold">
                  <UserCheck className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>{n.authorName}</span>
                  <span className="text-[10px] font-normal text-[#92400E]">
                    ({n.authorRole})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#92400E] font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <p className="text-xs text-[#102A43] leading-relaxed pt-0.5">
                {n.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add New Note Input Form */}
      <form onSubmit={handleSave} className="space-y-2 pt-2 border-t border-[#FDE68A]/70">
        <label className="block text-[11px] font-semibold text-[#78350F] uppercase tracking-wider">
          Add Case Assessment Note:
        </label>
        <textarea
          rows={2}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Product label shows mismatch between declared quantity and observed package information. Evidence appears sufficient for further inspection..."
          className="w-full text-xs p-2.5 rounded-lg border border-[#FCD34D] bg-white text-[#102A43] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D97706]"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newNote.trim()}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#D97706] text-white hover:bg-[#B45309] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Internal Note
          </button>
        </div>
      </form>
    </div>
  );
}
