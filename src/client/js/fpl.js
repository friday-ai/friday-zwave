/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
class FridayConnector {
  constructor() {
    this.id = '';
    this.ws = new WebSocket(window.location.origin.replace('http', 'ws'));

    window.addEventListener('message', this.handleParentMessage);
    this.ws.onmessage = this.handleWsMessage;
    this.sendWsMsg({ type: 'get-plugin-state' });
  }

  sendWsMsg = (message) => {
    if (this.ws.readyState !== this.ws.OPEN) {
      this.ws.onopen = () => {
        this.ws.send(JSON.stringify(message));
        // After that, remove useless listener
        this.ws.onopen = null;
      };
    } else {
      this.ws.send(JSON.stringify(message));
    }
  };

  handleWsMessage = (message) => {
    const msg = JSON.parse(message.data);

    switch (msg.type) {
      case 'friday-refresh':
        this.notifyParent('plugin-refresh', {});
        break;
      case 'plugin-state':
        this.notifyParent('plugin-state', { state: msg.data });
        break;
      default:
        window.dispatchEvent(new CustomEvent('plugin-message', { detail: msg }));
        break;
    }
  };

  handleParentMessage = (event) => {
    const msg = event.data;

    if (msg.source === 'friday') {
      this.id = msg.id;

      switch (msg.type) {
        case 'get-content-length':
          this.getLengthContent();
          break;
        case 'get-state':
          break;
        case 'set-theme':
          this.setTheme(msg);
          break;
        default:
          break;
      }
    }
  };

  notifyParent = (type, message) => {
    window.parent.postMessage({ source: 'fpl', type, id: this.id, data: JSON.parse(JSON.stringify(message)) }, '*');
  };

  setTheme = (data) => {
    document.documentElement.setAttribute('data-theme', data.theme);

    const styleSheet = document.getElementById('friday_theme');
    if (styleSheet) {
      styleSheet.textContent = data.css;
    } else {
      const style = document.createElement('style');
      style.textContent = data.css;
      style.id = 'friday_theme';
      document.head.appendChild(style);
    }
  };

  getLengthContent = () => {
    // Force "fit content" to get the real necessary width
    document.body.style.width = 'fit-content';

    const msg = {
      width: document.body.scrollWidth,
      height: document.body.scrollHeight,
    };

    this.notifyParent('content-length', msg);
    // When width is transferred to parent, remove "fit content"
    document.body.style = '';
  };
}

class FridayPlugin {
  constructor() {
    this.version = '1.0.0';
    this.authenticated = false;
    this.views = {};
    this.connector = new FridayConnector();
  }

  initialize = (options) => {
    if (this.authenticated === true) {
      console.warn(
        'Warning: calling FridayPlugin.initialize() more than once will have no effect. It is expected that you call it only once on your index connector.'
      );
      return;
    }

    // gerer les callback (modal et autres)
    // gérer l'auth

    this.connector.notifyParent('initViews', options);
    this.authenticated = true;
    this.views = options;
  };

  openModal = (id) => {
    if (this.authenticated === false) {
      console.error('Error: Friday Plugin is not initialized. Please call FridayPlugin.initialize() on your index connector.');
      return;
    }

    let modals = this.views.modale || [];
    modals = modals.filter((modal) => modal.id === id);

    if (modals.length > 0) {
      this.connector.notifyParent('open-modal', { id });
    }
  };

  /** Connector Syntactic sugar */
  sendWsMsg = (message) => this.connector.sendWsMsg(message);
}

// eslint-disable-next-line func-names
(function () {
  if (window.FridayPlugin === undefined) {
    window.FridayPlugin = new FridayPlugin();
  }
})();
