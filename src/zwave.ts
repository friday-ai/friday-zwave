import { Driver, ZWaveNode } from 'zwave-js';
import FPL, { Catch, DeviceRegisterType, logger, PluginMode } from '@friday-ai/fpl-sdk';

import build from './zwave/build';
import exec from './zwave/exec';

export default class Zwave {
  public build = build;
  public exec = exec;

  public mode: PluginMode = PluginMode.NOMINAL;
  public nodes: ZWaveNode[] = [];
  public t: DeviceRegisterType[] = [];
  public driver = new Driver('', { logConfig: { level: 0 } });
  public fpl = new FPL('Zwave', this.exec.bind(this));
  public database = this.fpl.database;

  @Catch()
  public async setPort(port: string): Promise<boolean> {
    await this.start(port);
    await this.database.insert('/params/port', port);
    this.mode = PluginMode.NOMINAL;
    return true;
  }

  @Catch()
  public async init(): Promise<void> {
    const port = await this.database.getData<string>('/params/port');

    if (port !== '') {
      await this.start(port);
    } else {
      this.mode = PluginMode.WAITING_CONFIGURATION;
      logger.warning('Zwave plugin is waiting for configuration');
    }
  }

  @Catch()
  public async start(port: string): Promise<void> {
    this.driver = new Driver(port, { logConfig: { level: 1 } });

    this.driver.on('error', (e) => {
      logger.error(e.message);
    });

    this.driver.once('driver ready', async () => {
      const data = await this.database.getData<string[]>('/nodes', []);
      const nodes: DeviceRegisterType[] = [];

      // Build list of registered devices
      data.forEach((d: string) => nodes.push(JSON.parse(d)));

      this.driver.controller.nodes.forEach((node) => {
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
}
