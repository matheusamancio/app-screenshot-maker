'use client';

import React from 'react';
import Dropdown from './Dropdown';
import { FONT_OPTIONS } from '@/lib/fonts';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function FontPicker({ value, onChange }: Props) {
  return (
    <Dropdown
      value={value}
      onChange={onChange}
      options={FONT_OPTIONS.map((f) => ({
        value: f.id,
        label: f.label,
        group: f.group || 'Other',
        badge: f.badge,
      }))}
    />
  );
}
