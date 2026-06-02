'use client';

import React from 'react';
import Modal from '../../ui/Modal';
import Dropdown from '../../ui/Dropdown';
import ColorPicker from '../../ui/ColorPicker';
import FontPicker from '../../ui/FontPicker';
import GradientEditor from '../../ui/GradientEditor';
import { useProjectStore } from '@/store/projectStore';
import { useToast } from '../../ui/Toast';
import type { DeviceFrameStyle, BackgroundType } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GlobalsModal({ open, onClose }: Props) {
  const globals = useProjectStore((s) => s.globals);
  const updateGlobals = useProjectStore((s) => s.updateGlobals);
  const applyGlobalsToAll = useProjectStore((s) => s.applyGlobalsToAll);
  const { toast } = useToast();

  const setBg = (b: Partial<typeof globals.background>) => updateGlobals({ background: { ...globals.background, ...b } });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Global settings"
      description="Defaults applied across slides."
      size="md"
      footer={
        <>
          <button
            onClick={() => {
              updateGlobals({
                fontFamily: 'Sora',
                primaryColor: '#5B5FED',
                accentColor: '#F59E0B',
                deviceFrameStyle: 'real-dark',
              });
              toast('Reset to Norte defaults', 'success');
            }}
            className="h-9 px-3 rounded-md bg-muted border border-border-default text-secondary text-sm font-medium hover:bg-overlay"
          >
            Reset
          </button>
          <button
            onClick={() => {
              applyGlobalsToAll();
              toast('Globals applied to all slides', 'success');
              onClose();
            }}
            className="h-9 px-4 rounded-md bg-norte-primary text-white text-sm font-sora font-semibold hover:bg-norte-primary-hover"
          >
            Apply to all slides →
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-5">
        <div>
          <div className="section-label mb-1.5">Primary font</div>
          <FontPicker value={globals.fontFamily} onChange={(v) => updateGlobals({ fontFamily: v })} />
        </div>
        <div>
          <div className="section-label mb-1.5">Default device style</div>
          <Dropdown<DeviceFrameStyle>
            value={globals.deviceFrameStyle}
            onChange={(v) => updateGlobals({ deviceFrameStyle: v })}
            options={[
              { value: 'real-dark', label: 'Real Dark' },
              { value: 'real-light', label: 'Real Light' },
              { value: 'clay-dark', label: 'Clay Dark' },
              { value: 'clay-light', label: 'Clay Light' },
              { value: 'outline', label: 'Outline' },
              { value: 'none', label: 'None' },
            ]}
          />
        </div>
        <div>
          <div className="section-label mb-1.5">Primary color</div>
          <ColorPicker color={globals.primaryColor} onChange={(c) => updateGlobals({ primaryColor: c })} />
        </div>
        <div>
          <div className="section-label mb-1.5">Accent color</div>
          <ColorPicker color={globals.accentColor} onChange={(c) => updateGlobals({ accentColor: c })} />
        </div>
        <div className="col-span-2">
          <div className="section-label mb-1.5">Default background</div>
          <div className="bg-overlay border border-border-default rounded-md p-3">
            <Dropdown<BackgroundType>
              value={globals.background.type}
              onChange={(v) => setBg({ type: v })}
              options={[
                { value: 'solid', label: 'Solid' },
                { value: 'linear-gradient', label: 'Linear gradient' },
                { value: 'radial-gradient', label: 'Radial gradient' },
                { value: 'mesh', label: 'Mesh' },
                { value: 'none', label: 'None' },
              ]}
            />
            {(globals.background.type === 'linear-gradient' || globals.background.type === 'radial-gradient') &&
              globals.background.gradientStops && (
                <div className="mt-3">
                  <GradientEditor
                    stops={globals.background.gradientStops}
                    angle={globals.background.gradientAngle ?? 135}
                    onChange={(stops, angle) => setBg({ gradientStops: stops, gradientAngle: angle, presetId: undefined })}
                  />
                </div>
              )}
            {globals.background.type === 'solid' && (
              <div className="mt-3">
                <ColorPicker color={globals.background.solidColor || '#5B5FED'} onChange={(c) => setBg({ solidColor: c })} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
