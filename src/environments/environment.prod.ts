export const environment = {
  name: 'production',
  production: true,
  sandbox: false,
  shortUrl: 'https://oengus.fun',
  // baseSite: 'https://oengus.io',
  get baseSite() {
    return window.location.origin;
  },
  api: 'https://oengus.io/api',
  twitterClientId: 'Z0Zta2JiTjNLQU5iNHlBbGcyLUI6MTpjaQ',
  twitchClientId: '7orlymdydp1t85kd9h6kxht107gxag',
  discordClientId: '1405833220687400991',
  paypalClientId: 'AfkLlDPvmM0v1914bih8VN0x0LZps-jkjdz-A7ydiJ0RVPdaAC730VWtVkTWaXZauBYVs3UbaoRHc6VH',
  patreonClientId: 'qXKJ92UNMBtSTV_N0TN47U6l1o2_VXWmqK3u9_Gv3RXIJuiJ0LTpDyzbl5XZuARH',
  get loginRedirect() {
    return environment.baseSite + '/login/';
  },
  get syncRedirect() {
    return environment.baseSite + '/user/settings/sync/';
  },
  get patronApi() {
    return environment.api + '/patreon';
  },
  // v2Domain: 'https://oengus.io/',
  v2Domain: false,
  donationsDisabled: true,
  newScheduleEditTable: false,
};
