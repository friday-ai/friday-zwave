import { Driver } from 'zwave-js';
import { DeviceRegisterType, logger, PluginMode } from '@friday-ai/fpl-sdk';
import Zwave from '../zwave';

export default async function connect(this: Zwave, port: string): Promise<void> {
  this.driver = new Driver(port, { logConfig: { level: 2 } });

  this.driver.on('error', (e) => {
    logger.error(e.message);
    this.fpl.sendWsMsg({ type: 'device-connection-failed' });
  });

  this.driver.on('all nodes ready', () => {
    this.fpl.sendWsMsg({ type: 'scan-complete' });
    this.mode = PluginMode.NOMINAL;
  });

  this.driver.once('driver ready', async () => {
    this.fpl.sendWsMsg({ type: 'device-connected' });
    this.setPort(port);

    const data = await this.database.getData<string[]>('/nodes', []);
    const nodes: DeviceRegisterType[] = [];

    // Build list of registered devices
    data.forEach((d: string) => nodes.push(JSON.parse(d)));

    this.driver?.controller.nodes.forEach((node) => {
      // Filter controller node
      // And add other nodes to list
      if (!node.isControllerNode) {
        node.on('ready', async () => {
          // If node isn't present in list, build it and send to master
          if (nodes.filter((n) => Number(n.pluginSelector) === node.id).length === 0) {
            await this.build(node);
          }
          this.nodes.push(node);
        });
      }
    });
  });

  await this.driver.start();
}
