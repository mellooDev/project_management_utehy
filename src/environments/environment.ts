// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  SITE_KEY: '6LfueB8cAAAAAD74PxsPKL7-GVr0T7dUoxuBL4iR',
  IS_USE_CAPTCHA: true,
  production: false,
  appVersion: 'v8.2.3',

  apiBaseUrl: 'http://10.1.125.122:8080/',
  apiBaseUrlOauth : 'http://10.1.125.122.nip.io:8000/authen/',

 billing: (window["env"]["API_BASE_URL"] || "http://10.1.125.122:8000") + '/billing',
  payment: (window["env"]["API_BASE_URL"] || "http://10.1.125.122:8000") + '/payment',

//   billing: 'http://10.1.125.82:9001',
//  payment: 'http://10.1.125.82:9095',
  authen: (window["env"]["API_BASE_URL"] || 'http://10.1.125.122:8000') + '/authen',
//   authen: 'http://localhost:8080',
  dataCatalog: (window["env"]["API_BASE_URL"] || 'http://10.1.125.122:8000') + '/data-catalog',
  // dataCatalog: 'http://localhost:8097',
  dataManagement: (window["env"]["API_BASE_URL"] || 'http://10.1.125.122:8000') + '/data-management',
  // dataManagement: 'http://localhost:8096',
  ingest: (window["env"]["API_BASE_URL"] || 'http://10.1.125.122:8000') + '/ingest',
  notify: (window["env"]["API_BASE_URL"] || 'http://10.1.125.122:8000') + '/notify',
  report: (window["env"]["API_BASE_URL"] || 'http://10.1.125.122:8000') +  '/report',


  apiCatalogBaseUrl: 'http://10.1.125.122:3000',
  apiProductBaseUrl: 'http://10.1.125.84:8097/',
  apiBaseDb: 'http://10.1.125.122:8096/',
  apiOrderBaseUrl: 'http://10.1.125.122:9011/',
  apiPaymentBaseUrl: 'http://10.1.125.122:8095/',
  redirectFeUrl: 'http://10.1.125.122.nip.io:8005/',
  // redirectFeUrl:'http://localhost:4200/',
  ingressApiUrl: 'http://10.1.125.122:8099/',
  gatewayUrl: 'http://10.1.125.122:8000/',
  notifyApiUrl: 'http://10.1.125.122:8100/',
  isMockEnabled: true,
  apiUrl: 'api/v1',


};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
