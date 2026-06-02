import React from 'react';
import { render, screen } from '@testing-library/react';
import WaveformViewer from '../src/components/charts/WaveformViewer';

test('renders waveform SVG', () => {
  const mean = Array.from({length:100}, (_,i) => Math.sin(i/10));
  const sigma = Array.from({length:100}, () => 0.05);
  render(<WaveformViewer mean={mean} sigma={sigma} width={400} height={120} />);
  const svg = document.querySelector('svg.waveform-svg');
  expect(svg).toBeTruthy();
});
