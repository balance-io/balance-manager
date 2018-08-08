import bowser from 'bowser';

const isMobile = () => {
  const browser = bowser.getParser(window.navigator.userAgent);

  return browser.some(['mobile', 'tablet']);
};

const isValidBrowser = () => {
  const browser = bowser.getParser(window.navigator.userAgent);

  return !browser.some(['Internet Explorer', 'Microsoft Edge', 'Safari']);
};

export { isMobile, isValidBrowser };
