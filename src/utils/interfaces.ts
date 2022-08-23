import { DeviceCapabilityRegisterType } from '@friday-ai/fpl-sdk';

export type DefinitionsType = {
  defaultName: string;
  defaultManufacturer: string;
  defaultModel: string;
  type: string;
  capabilities?: DeviceCapabilityRegisterType[];
  zwave_capabilities: {
    [key: string]: {
      [key: string]: ZwaveDeviceCapabilitiesType | unknown;
    };
  };
};

export type ZwaveDeviceCapabilitiesType = {
  cc: number;
  endpoint: number;
  property: number;
  current: number;
  mapTo?: string;
};

export type ZwaveType = {
  [key: string]: DefinitionsType;
};
