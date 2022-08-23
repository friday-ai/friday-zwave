import { ZWaveNode } from 'zwave-js';
import { DeviceRegisterType, DevicesType, logger } from '@friday-ai/fpl-sdk';
import ZwaveClass from '../zwave';
import { ZwaveDeviceCapabilitiesType, ZwaveType } from '../utils/interfaces';

import * as devicesDefinitions from '../../cache/devices.definitions.json';

const definitions: ZwaveType = devicesDefinitions as ZwaveType;

export default async function build(this: ZwaveClass, node: ZWaveNode): Promise<void> {
  // Mapping the node to friday device
  const zwaveDevice: string = node.deviceClass?.specific.zwavePlusDeviceType || '';
  const nodeType = definitions[zwaveDevice];
  // If a node type was found, bind capabilities
  if (nodeType !== undefined) {
    Object.keys(nodeType.zwave_capabilities).forEach((capabilityKey: string) => {
      // Get abstract capability object
      const zwaveCapabilities = nodeType.zwave_capabilities[capabilityKey];
      // Check if this capability is not a sensor
      if (zwaveCapabilities.sensor === false) {
        Object.keys(zwaveCapabilities).forEach((valueKey: string) => {
          // Get abstract value object
          const zwaveCapability = zwaveCapabilities[valueKey] as ZwaveDeviceCapabilitiesType;
          // Check if capability has parameters to bind
          if (typeof zwaveCapability === 'object') {
            // "value" contains commandClass, endpoint and property corresponding to the parameter of the node
            const { cc: commandClass, endpoint, property, mapTo } = zwaveCapability;
            // Interview the node to get parameter value corresponding to the capability
            zwaveCapability.current = node.getValue({ commandClass, endpoint, property }) || 0;
            // Override the value on object
            nodeType.zwave_capabilities[capabilityKey][valueKey] = zwaveCapability;

            // If the zwave_capability has a mapTo property, bind the value to corresponding friday capability
            if (mapTo !== undefined) {
              const keys = mapTo.split('.');
              const capabilities = nodeType.capabilities || [];

              // Find the corresponding capability
              capabilities.forEach((capability) => {
                if (capability.type === keys[0]) {
                  // If the capability has a settings property, bind the value
                  if (capability.settings?.[keys[1]] !== undefined) {
                    capability.settings[keys[1]] = zwaveCapability.current;
                  }
                }
              });

              // Override the value on object
              nodeType.capabilities = capabilities;
            }
          }
        });
      }
    });

    const device: DeviceRegisterType = {
      defaultName: nodeType.defaultName,
      defaultManufacturer: nodeType.defaultManufacturer,
      defaultModel: nodeType.defaultModel,
      type: nodeType.type as DevicesType,
      pluginId: '9a5d34c4-d8cf-4093-94f2-142005ebfd66',
      pluginSelector: node.id.toString(),
      capabilities: nodeType.capabilities,
    };

    this.fpl.registerDevice(device);
    await this.fpl.database.insert(`/nodes[]`, device);
    logger.info(`Zwave node ${node.id} registered`);
  }
}
