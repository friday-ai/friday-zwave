import { logger } from 'fpl-sdk';
import Zwave from './src/zwave';

(async () => {
  try {
    // Create Zwave object
    const zwave = new Zwave();

    // Start Zwave core
    logger.title('Starting Zwave core');
    await zwave.init();
  } catch (e) {
    const err = e as Error;
    logger.error(err.message);
  }
})();
