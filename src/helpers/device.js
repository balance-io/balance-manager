import bowser from 'bowser';

const isValidBrowser = () => {
  const browser = bowser.getParser(window.navigator.userAgent);

  return !browser.some(['Internet Explorer', 'Microsoft Edge', 'Safari']);
};

export default isValidBrowser;
