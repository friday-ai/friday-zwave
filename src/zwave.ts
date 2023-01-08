import { Driver, ZWaveNode } from 'zwave-js';
import FPL, { Catch, logger, PluginMode } from '@friday-ai/fpl-sdk';

import connect from './zwave/connect';
import build from './zwave/build';
import exec from './zwave/exec';
import handleClientMsg from './zwave/ws';
import { SerialPort } from 'serialport';

export default class Zwave {
  public build = build;
  public exec = exec;
  public handleClientMsg = handleClientMsg;

  public mode: PluginMode = PluginMode.NOMINAL;
  public nodes: ZWaveNode[] = [];
  public driver: Driver | undefined;

  public fpl = new FPL('Zwave', this.exec.bind(this), this.handleClientMsg.bind(this));
  public database = this.fpl.database;

  @Catch()
  public async init(): Promise<void> {
    const port = await this.database.getData<string>('/params/port', 'null');

    if (port !== 'null') {
      await this.connect(JSON.parse(port));
    } else {
      this.mode = PluginMode.WAITING_CONFIGURATION;
      logger.warning('Zwave plugin is waiting for configuration');
    }
  }

  @Catch()
  public async connect(port: string): Promise<void> {
    return connect.call(this, port);
  }

  @Catch()
  public async setPort(port: string): Promise<boolean> {
    await this.database.insert('/params/port', port);
    return true;
  }
}
