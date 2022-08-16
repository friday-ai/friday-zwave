import { Driver, ZWaveNode } from 'zwave-js';
import FPL, { Catch, DeviceRegisterType, logger, PluginMode } from 'fpl-sdk';

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
      const nodes = await this.database.getData<number[]>('/nodes', []);
      this.driver.controller.nodes.forEach((node) => {
        // Filter controller node
        // And add other nodes to list
        if (!node.isControllerNode) {
          node.on('ready', async () => {
            if (nodes.indexOf(node.nodeId) === -1) {
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
