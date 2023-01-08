/** ***** Constants ****** */

const FPL = window.FridayPlugin;

const step1 = document.getElementById('step-1');
const step3 = document.getElementById('step-3');

const step1Indicator = document.getElementById('step-1-indicator');
const step2Indicator = document.getElementById('step-2-indicator');
const step3Indicator = document.getElementById('step-3-indicator');

const loading = document.getElementById('loading');
const loadingMsg = document.getElementById('loading-msg');
const loadingSubMsg = document.getElementById('loading-submsg');

const devicesSelect = document.getElementById('devices');
const connectButton = document.getElementById('connect');

const countdownStyle = document.getElementById('countdown').style;

/** ***** Variables ****** */

let currentStep = 1;
let countdown = 5;

/** ***** Functions ****** */

const updateStep = () => {
  step1.classList.add('hidden');
  step3.classList.add('hidden');

  switch (currentStep) {
    case 1:
      step1.classList.remove('hidden');
      break;
    case 2:
      step1Indicator.setAttribute('data-content', '✓');
      step2Indicator.classList.add('step-primary');
      break;
    case 3:
      step1Indicator.setAttribute('data-content', '✓');
      step1Indicator.classList.add('step-primary');
      step2Indicator.classList.add('step-primary');
      step2Indicator.setAttribute('data-content', '✓');
      step3Indicator.classList.add('step-primary');
      step3Indicator.setAttribute('data-content', '✓');
      step3.classList.remove('hidden');
      loading.classList.add('hidden');
      break;
    default:
      break;
  }
};

const connect = () => {
  step1.classList.add('hidden');
  loading.classList.remove('hidden');
  loadingMsg.innerText = 'Connecting...';

  FPL.sendWsMsg({ type: 'connect-device', data: devicesSelect.value });
};

const onSelectDevice = () => {
  connectButton.disabled = false;
};

const refreshUsbList = () => FPL.sendWsMsg({ type: 'get-usb-devices' });

window.addEventListener('plugin-message', (e) => {
  const msg = e.detail;

  switch (msg.type) {
    case 'devices-list': {
      let opt = document.createElement('option');
      // Clean all childs before
      devicesSelect.innerHTML = '';
      opt.textContent = 'Pick one';
      opt.disabled = true;
      opt.selected = true;
      devicesSelect.appendChild(opt);

      // Add new options childs
      msg.data.forEach((device) => {
        opt = document.createElement('option');
        opt.value = device.path;
        opt.textContent = device.friendlyName;
        devicesSelect.appendChild(opt);
      });
      break;
    }
    case 'device-connected':
      currentStep = 2;
      loadingMsg.innerText = 'Scanning network...';
      loadingSubMsg.innerText = 'Please wait, this step can take a few moments according to your number of nodes';
      loadingSubMsg.classList.remove('hidden');
      updateStep();
      break;
    case 'scan-complete':
      currentStep = 3;
      updateStep();
      countdownStyle.setProperty('--value', countdown.toString());
      setInterval(() => {
        if (countdown > 0) {
          countdown -= 1;
          countdownStyle.setProperty('--value', countdown.toString());
        } else {
        }
      }, 1000);
      break;
    default:
      console.warn(`Message type: "${msg.type}" not handled`);
      break;
  }
});

/** ***** Initialization ****** */
refreshUsbList();
