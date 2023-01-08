import { logger } from '@friday-ai/fpl-sdk';
import ZwaveClass from '../zwave';

export default async function exec(this: ZwaveClass, device: string, action: string, params: any): Promise<void> {
  const nodeKey = Number(device);

  const node = this.nodes.filter((n) => n.nodeId === nodeKey)[0];

  switch (action) {
    case 'action.devices.commands.turn_on':
      logger.info(`Turning on device ${device}`);
      // await turnOn(device, params);
      await node.commandClasses.Basic.set(100);
      break;
    case 'action.devices.commands.turn_off':
      logger.info(`Turning off device ${device}`);
      // await turnOff(device, params);
      await node.commandClasses.Basic.set(0);
      break;
    case 'action.devices.commands.set_brightness':
      logger.info(`Setting brightness of device ${device} to ${params.value}`);
      // await setBrightness(device, params);
      await node.commandClasses.Basic.set(params.value);
      break;
    default:
      logger.error(`Unknown method ${action}`);
      break;
  }
}
