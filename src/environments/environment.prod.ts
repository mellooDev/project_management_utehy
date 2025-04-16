// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  SITE_KEY: '6LfueB8cAAAAAD74PxsPKL7-GVr0T7dUoxuBL4iR',
  IS_USE_CAPTCHA: true,

  apiBaseUrl: 'https://api.dataexchange.vn/ids/',
  billing: (window["env"]["API_BASE_URL"] || "http://10.1.125.122:8000") + '/billing',
  authen: (window["env"]["API_BASE_URL"] || 'http://10.1.125.122:8000') + '/authen',
  dataCatalog: (window["env"]["API_BASE_URL"] || 'http://10.1.125.122:8000') + '/data-catalog',
  dataManagement: (window["env"]["API_BASE_URL"] || 'http://10.1.125.122:8000') + '/data-management',
  ingest: (window["env"]["API_BASE_URL"] || 'http://10.1.125.122:8000') + '/ingest',
  notify: (window["env"]["API_BASE_URL"] || 'http://10.1.125.122:8000') + '/notify',
  report: (window["env"]["API_BASE_URL"] || 'http://10.1.125.122:8000') +  '/report',


  apiCatalogBaseUrl: 'http://dataexchange.vn:3000',
  apiProductBaseUrl: 'https://api.dataexchange.vn/dc/',
  apiBaseDb: 'https://api.dataexchange.vn/dm/',
  apiOrderBaseUrl: 'https://api.dataexchange.vn/bl/',
  apiPaymentBaseUrl: 'https://api.dataexchange.vn/pm/',
  redirectFeUrl:'https://dataexchange.vn/',
  ingressApiUrl: 'https://api.dataexchange.vn/ig/',
  gatewayUrl: 'https://api.dataexchange.vn/',
  apiUrl: 'api/v1',
  production: true,
  appVersion: 'v8.2.3',
  USERDATA_KEY: 'authf649fc9a5f55',
  isMockEnabled: true
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
