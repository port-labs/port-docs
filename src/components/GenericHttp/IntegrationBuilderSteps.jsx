import React from 'react';
import { IntegrationBuilderProvider } from './IntegrationBuilderContext';
import { Step1ApiConfig } from './Step1ApiConfig';
import { Step2DataMapping } from './Step2DataMapping';
import { Step3Installation } from './Step3Installation';

export function IntegrationBuilderSteps() {
  return (
    <IntegrationBuilderProvider>
      <Step1ApiConfig />
      <Step2DataMapping />
      <Step3Installation />
    </IntegrationBuilderProvider>
  );
}

