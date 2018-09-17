/**
 * @desc boot intercom
 * @return {Intercom}
 */
export const bootIntercom = () => {
  let appID;
  switch (process.env.NODE_ENV) {
    case 'development':
      break;
    case 'test':
      appID = 'k8c9ptl1';
      break;
    case 'production':
      appID = 'j0fl7v0m';
      break;
    default:
      return;
  }
  const setup = () => window.Intercom('boot', { app_id: appID });
  if (typeof window.Intercom !== 'undefined') setup();
  else setTimeout(setup, 500);
};
