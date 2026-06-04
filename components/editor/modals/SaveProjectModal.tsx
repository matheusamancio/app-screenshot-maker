'use client';

import React, { useEffect, useState } from 'react';
import Modal from '../../ui/Modal';
import { useProjectStore } from '@/store/projectStore';
import { useToast } from '../../ui/Toast';

interface Props {
  open: boolean;
  onClose: () => void;
  /** When true, save the board as a reusable template instead of a project. */
  asTemplate?: boolean;
}

export default function SaveProjectModal({ open, onClose, asTemplate = false }: Props) {
  const name = useProjectStore((s) => s.name);
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const projects = useProjectStore((s) => s.projects || []);
  const saveProject = useProjectStore((s) => s.saveProject);
  const saveProjectAsTemplate = useProjectStore((s) => s.saveProjectAsTemplate);
  const { toast } = useToast();

  const existing = !asTemplate ? projects.find((p) => p.id === currentProjectId && !p.isTemplate) : undefined;
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) setValue(asTemplate ? `${name} template` : existing?.name || name || 'Untitled project');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = () => {
    const n = value.trim();
    if (!n) return;
    if (asTemplate) {
      saveProjectAsTemplate(n);
      toast(`Saved template “${n}”`, 'success');
    } else {
      saveProject(n);
      toast(existing ? `Updated “${n}”` : `Saved “${n}”`, 'success');
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={asTemplate ? 'Save as template' : existing ? 'Save project' : 'Save as a new project'}
      description="Give your board a name so you can find it later."
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="h-9 px-4 rounded-md bg-muted border border-border-default text-secondary text-sm font-medium hover:bg-overlay">
            Cancel
          </button>
          <button onClick={submit} disabled={!value.trim()} className="h-9 px-4 rounded-md bg-norte-primary text-white text-sm font-sora font-semibold hover:bg-norte-primary-hover disabled:opacity-40">
            {asTemplate ? 'Save template' : 'Save project'}
          </button>
        </>
      }
    >
      <div className="section-label mb-1.5">{asTemplate ? 'Template name' : 'Project name'}</div>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="My App Screenshots"
        className="w-full h-10 px-3 text-sm bg-overlay border border-border-default rounded-md text-primary focus:border-norte-primary focus:outline-none"
      />
      {existing && !asTemplate && (
        <p className="text-[11px] text-text-muted mt-2">Updating “{existing.name}” — change the name to rename it.</p>
      )}
    </Modal>
  );
}
