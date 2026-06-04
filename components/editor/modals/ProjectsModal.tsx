'use client';

import React, { useState } from 'react';
import Modal from '../../ui/Modal';
import { useProjectStore } from '@/store/projectStore';
import type { SavedProject } from '@/types';
import { useToast } from '../../ui/Toast';

interface Props {
  open: boolean;
  onClose: () => void;
}

function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function ProjectsModal({ open, onClose }: Props) {
  const projects = useProjectStore((s) => s.projects || []);
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const saveProject = useProjectStore((s) => s.saveProject);
  const newProject = useProjectStore((s) => s.newProject);
  const openProject = useProjectStore((s) => s.openProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const renameProject = useProjectStore((s) => s.renameProject);
  const duplicateProject = useProjectStore((s) => s.duplicateProject);
  const templatizeProject = useProjectStore((s) => s.templatizeProject);
  const currentName = useProjectStore((s) => s.name);
  const { toast } = useToast();

  const [tab, setTab] = useState<'projects' | 'templates'>('projects');
  const myProjects = projects.filter((p) => !p.isTemplate).sort((a, b) => b.updatedAt - a.updatedAt);
  const templates = projects.filter((p) => p.isTemplate).sort((a, b) => b.updatedAt - a.updatedAt);
  const list = tab === 'projects' ? myProjects : templates;

  // Before replacing the working deck, don't lose work: auto-save a named project,
  // or confirm before discarding an unsaved one.
  const guardSwitch = (): boolean => {
    if (currentProjectId) { saveProject(); return true; }
    return window.confirm("Your current board isn't saved as a project yet. Switch and discard it?\n\n(Cancel, then “Save current deck”, to keep it.)");
  };

  const handleOpen = (p: SavedProject) => {
    if (!p.isTemplate && p.id === currentProjectId) { onClose(); return; }
    if (!guardSwitch()) return;
    openProject(p.id);
    toast(p.isTemplate ? `Started a new project from “${p.name}”` : `Opened “${p.name}”`, 'success');
    onClose();
  };

  const handleNew = () => {
    if (!guardSwitch()) return;
    newProject();
    toast('New blank project', 'success');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Projects" description="Your boards — open, duplicate, or turn one into a reusable template." size="xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 bg-overlay rounded-lg p-1 border border-border-default">
          <Tab active={tab === 'projects'} onClick={() => setTab('projects')}>My projects {myProjects.length > 0 && <span className="opacity-60">({myProjects.length})</span>}</Tab>
          <Tab active={tab === 'templates'} onClick={() => setTab('templates')}>Templates {templates.length > 0 && <span className="opacity-60">({templates.length})</span>}</Tab>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { saveProject(); toast('Current deck saved as a project', 'success'); setTab('projects'); }}
            className="h-9 px-3 rounded-md bg-muted border border-border-default text-secondary text-sm font-medium hover:bg-overlay"
          >
            Save current deck
          </button>
          <button
            onClick={handleNew}
            className="h-9 px-4 rounded-md bg-norte-primary text-white text-sm font-sora font-semibold hover:bg-norte-primary-hover"
          >
            + New project
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <div className="text-sm font-medium">
            {tab === 'projects' ? 'No saved projects yet.' : 'No templates yet.'}
          </div>
          <div className="text-xs mt-1">
            {tab === 'projects'
              ? 'Click “Save current deck” (or the Save button up top) to store this board.'
              : 'Use “Save as template” on a finished board to reuse it later.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              isCurrent={p.id === currentProjectId}
              onOpen={() => handleOpen(p)}
              onRename={(name) => renameProject(p.id, name)}
              onDuplicate={() => { duplicateProject(p.id); toast('Duplicated', 'success'); }}
              onDelete={() => { if (window.confirm(`Delete “${p.name}”? This can't be undone.`)) { deleteProject(p.id); toast('Deleted', 'success'); } }}
              onMakeTemplate={
                p.isTemplate
                  ? undefined
                  : () => { templatizeProject(p.id); toast(`“${p.name}” saved as a template`, 'success'); setTab('templates'); }
              }
            />
          ))}
        </div>
      )}

      <p className="text-[11px] text-text-muted mt-5">
        Editing “{currentName}”. Saving updates {currentProjectId ? 'this project' : 'creates a new project'} · templates spawn a fresh copy when opened.
      </p>
    </Modal>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`h-7 px-3 rounded-md text-xs font-semibold ${active ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted hover:text-secondary'}`}>
      {children}
    </button>
  );
}

function ProjectCard({
  project,
  isCurrent,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
  onMakeTemplate,
}: {
  project: SavedProject;
  isCurrent: boolean;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMakeTemplate?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);
  const slides = project.deck.slides || [];
  const firstTitle = slides[0]?.title?.text || project.deck.appName || 'Untitled';

  return (
    <div className={`group rounded-xl border bg-surface overflow-hidden flex flex-col ${isCurrent ? 'border-norte-primary ring-1 ring-norte-primary' : 'border-border-default hover:border-border-strong'}`}>
      {/* preview */}
      <button onClick={onOpen} className="relative h-32 bg-overlay flex items-center justify-center px-3 text-center" title="Open">
        <div className="absolute inset-0" style={{ background: project.deck.slides[0]?.background?.solidColor || '#EDEBE5', opacity: 0.5 }} />
        <div className="relative">
          <div className="text-[11px] font-sora font-bold text-primary leading-tight line-clamp-3">{firstTitle.replace(/\[|\]/g, '')}</div>
        </div>
        {/* slide chips */}
        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1">
          {slides.slice(0, 8).map((_, i) => (
            <span key={i} className="w-1.5 h-3 rounded-[2px] bg-black/15" />
          ))}
        </div>
        {project.isTemplate && (
          <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wider font-semibold bg-norte-primary text-white px-1.5 py-0.5 rounded">Template</span>
        )}
        {isCurrent && !project.isTemplate && (
          <span className="absolute top-2 right-2 text-[9px] uppercase tracking-wider font-semibold bg-norte-primary text-white px-1.5 py-0.5 rounded">Editing</span>
        )}
      </button>

      {/* meta + actions */}
      <div className="p-2.5 flex flex-col gap-1.5">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => { setEditing(false); if (draft.trim()) onRename(draft.trim()); }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setDraft(project.name); setEditing(false); } }}
            className="w-full h-7 px-2 text-sm bg-overlay border border-norte-primary rounded-md text-primary outline-none"
          />
        ) : (
          <button onClick={() => { setDraft(project.name); setEditing(true); }} className="text-left text-sm font-semibold text-primary truncate" title="Rename">
            {project.name}
          </button>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-text-muted">{slides.length} screen{slides.length !== 1 ? 's' : ''} · {timeAgo(project.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-1 pt-0.5">
          <CardBtn onClick={onOpen} primary>{project.isTemplate ? 'Use' : 'Open'}</CardBtn>
          {onMakeTemplate && <CardIcon title="Save as template" onClick={onMakeTemplate}><TemplateIcon /></CardIcon>}
          <CardIcon title="Duplicate" onClick={onDuplicate}><DupIcon /></CardIcon>
          <CardIcon title="Delete" danger onClick={onDelete}><TrashIcon /></CardIcon>
        </div>
      </div>
    </div>
  );
}

function CardBtn({ onClick, primary, children }: { onClick: () => void; primary?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex-1 h-7 rounded-md text-xs font-semibold ${primary ? 'bg-norte-primary text-white hover:bg-norte-primary-hover' : 'bg-muted border border-border-default text-secondary hover:bg-overlay'}`}>
      {children}
    </button>
  );
}
function CardIcon({ title, onClick, danger, children }: { title: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button title={title} onClick={onClick} className={`w-7 h-7 rounded-md flex items-center justify-center bg-muted border border-border-default text-text-muted hover:bg-overlay ${danger ? 'hover:text-error' : 'hover:text-norte-primary'}`}>
      {children}
    </button>
  );
}
function TemplateIcon() {
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>);
}
function DupIcon() {
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>);
}
function TrashIcon() {
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
}
