'use client';

import React from 'react';
import Modal from '../../ui/Modal';
import Dropdown from '../../ui/Dropdown';
import { useProjectStore } from '@/store/projectStore';
import type { Platform, Language } from '@/types';
import { LANGUAGES } from '@/lib/presets';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SetupModal({ open, onClose }: Props) {
  const name = useProjectStore((s) => s.name);
  const platform = useProjectStore((s) => s.platform);
  const appName = useProjectStore((s) => s.appName);
  const defaultLanguage = useProjectStore((s) => s.defaultLanguage);
  const setName = useProjectStore((s) => s.setName);
  const setPlatform = useProjectStore((s) => s.setPlatform);
  const setAppName = useProjectStore((s) => s.setAppName);
  const setDefaultLanguage = useProjectStore((s) => s.setDefaultLanguage);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Project setup"
      description="Configure project name, platform, and default language."
      size="sm"
      footer={
        <button onClick={onClose} className="h-9 px-4 rounded-md bg-norte-primary text-white text-sm font-sora font-semibold hover:bg-norte-primary-hover">
          Done
        </button>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="section-label mb-1.5">Project name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-9 px-3 bg-overlay border border-border-default rounded-md text-sm"
          />
        </div>
        <div>
          <div className="section-label mb-1.5">App name</div>
          <input
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="Used for export filename"
            className="w-full h-9 px-3 bg-overlay border border-border-default rounded-md text-sm"
          />
        </div>
        <div>
          <div className="section-label mb-1.5">Platform</div>
          <Dropdown<Platform>
            value={platform}
            onChange={setPlatform}
            options={[
              { value: 'ios', label: 'iOS only — App Store' },
              { value: 'android', label: 'Android only — Google Play' },
              { value: 'both', label: 'Both — App Store + Play Store' },
            ]}
          />
        </div>
        <div>
          <div className="section-label mb-1.5">Default language</div>
          <Dropdown<Language>
            value={defaultLanguage}
            onChange={setDefaultLanguage}
            options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
          />
        </div>
      </div>
    </Modal>
  );
}
