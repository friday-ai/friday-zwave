window.FridayPlugin.initialize({
  root: {
    header: {
      logo: 'https://raw.githubusercontent.com/zwave-js/zwave-js-ui/e4ae26d3798e9a83e12f01d1684b6ab6f6a81e97/docs/_images/zwavejs_logo.svg',
      badges: [
        { title: 'Controller status', value: 'Scan Complete' },
        { title: 'Plugin version', value: 'v1.0.0' },
        { title: 'ZwaveJS version', value: 'v10.0.0' },
        { title: 'Devices definitions version', value: 'v1.0.0' },
      ],
      action: {
        text: 'node manager',
        callback: () => window.FridayPlugin.openModal('zwave_manager'),
      },
    },
    tabs: [
      {
        type: 'devices',
        data: {
          keys: [
            { label: 'id', key: 'id' },
            { label: 'Manufacturer', key: 'manufacturer' },
            { label: 'Product', key: 'product' },
            { label: 'Product code', key: 'product_code' },
            { label: 'Status', key: 'status' },
            { label: 'Interview stage', key: 'interview_stage' },
            { label: 'Last active', key: 'last_active' },
          ],
          values: [
            {
              id: '1',
              manufacturer: 'Zwave.Me',
              product: 'Zwave USB Stick',
              product_code: 'UZB',
              status: 'Alive',
              interview_stage: 'Complete',
              last_active: '29/08/2022 21:00:00',
            },
            {
              id: '2',
              manufacturer: 'Fibaro',
              product: 'Dimmer Switch',
              product_code: 'FGD-212',
              status: 'Alive',
              interview_stage: 'Complete',
              last_active: '29/08/2022 21:00:00',
            },
            {
              id: '3',
              manufacturer: 'Fibaro',
              product: 'Dimmer Switch',
              product_code: 'FGD-212',
              status: 'Alive',
              interview_stage: 'Complete',
              last_active: '29/08/2022 21:00:00',
            },
          ],
        },
      },
    ],
  },
  config: {
    title: 'zwave_config',
    url: '/config.html',
  },
  modals: [
    {
      id: 'zwave_manager',
      title: 'Zwave manager',
      url: '/manager.html',
      actions: ['Next'],
    },
  ],
});
