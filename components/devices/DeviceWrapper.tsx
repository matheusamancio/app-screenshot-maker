'use client';

import React from 'react';
import IPhone15Frame from './IPhone15Frame';
import Pixel8Frame from './Pixel8Frame';
import NoFrame from './NoFrame';
import type { DeviceConfig } from '@/types';

interface Props {
  device: DeviceConfig;
  width: number;
  height: number;
  children?: React.ReactNode;
}

export default function DeviceWrapper({ device, width, height, children }: Props) {
  if (device.frameType === 'none' || device.frameStyle === 'none') {
    return (
      <NoFrame width={width} height={height}>
        {children}
      </NoFrame>
    );
  }
  if (device.frameType === 'pixel-8') {
    return (
      <Pixel8Frame style={device.frameStyle} width={width} height={height}>
        {children}
      </Pixel8Frame>
    );
  }
  return (
    <IPhone15Frame style={device.frameStyle} width={width} height={height}>
      {children}
    </IPhone15Frame>
  );
}
