import { SerialPort } from 'serialport';
import { logger } from '@friday-ai/fpl-sdk';
import ZwaveClass from '../zwave';

export default async function handleClientMsg(this: ZwaveClass, msg: { type: string; data: any }) {
  switch (msg.type) {
    case 'get-plugin-state':
      this.fpl.sendWsMsg({ type: 'plugin-state', data: this.mode });
      break;
    case 'get-usb-devices':
      this.fpl.sendWsMsg({ type: 'devices-list', data: await SerialPort.list() });
      break;
    case 'connect-device':
      this.connect(msg.data);
      break;
    default:
      logger.warning(`Message type: "${msg.type}" not handled`);
      break;
  }
}
