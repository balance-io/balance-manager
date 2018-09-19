import trustWalletLogoImage from '../assets/trustwallet-logo.svg';
import statusWalletLogoImage from '../assets/statuswallet-logo.svg';
import ethImage from '../assets/eth.svg';

const isDappBrowser = () => {
  return typeof window.web3 !== 'undefined';
};

const detectDappBrowser = () => {
  let result = defaultWallet;

  if (isTrust()) result = trustWallet;
  else if (isStatus()) result = statusWallet;

  return result;
};

const isTrust = () => {
  return isDappBrowser() && window.web3.currentProvider.isTrust;
};

const isStatus = () => {
  return isDappBrowser() && window.web3.currentProvider.isStatus;
};

const trustWallet = {
  image: trustWalletLogoImage,
  imageAlt: 'Trust Wallet Logo',
  descriptionPartOne: 'homepage.connect_trustwallet.description_part_one',
  descriptionPartTwo: 'homepage.connect_trustwallet.description_part_two',
  descriptionPartThree: 'homepage.connect_trustwallet.description_part_three',
  linkWallet: 'https://trustwalletapp.com/',
  linkTitleWallet: 'homepage.connect_trustwallet.link_title_wallet',
  linkTextWallet: 'homepage.connect_trustwallet.link_text_wallet',
  linkBrowser: 'https://trustwalletapp.com/features/trust-browser',
  linkTitleBrowser: 'homepage.connect_trustwallet.link_title_browser',
  linkTextBrowser: 'homepage.connect_trustwallet.link_text_browser',
  color: 'trustwallet',
  hoverColor: 'trustwalletHover',
  activeColor: 'trustwalletActive',
  buttonText: 'homepage.connect_trustwallet.button',
};

const statusWallet = {
  image: statusWalletLogoImage,
  imageAlt: 'Status Wallet Logo',
  descriptionPartOne: 'Use the Status Ethereum dapp browser app to connect',
  descriptionPartTwo: null,
  descriptionPartThree: null,
  linkWallet: 'https://status.im/',
  linkTitleWallet: null,
  linkTextWallet: null,
  linkBrowser: 'https://status.im/#',
  linkTitleBrowser: null,
  linkTextBrowser: null,
  color: 'statuswallet',
  hoverColor: 'statuswalletHover',
  activeColor: 'statuswalletActive',
  buttonText: 'Connect to Status',
};

const defaultWallet = {
  image: ethImage,
  imageAlt: 'Ethereum Logo',
  descriptionPartOne: 'Connect with your current dapp browser',
  descriptionPartTwo: null,
  descriptionPartThree: null,
  linkWallet: null,
  linkTitleWallet: null,
  linkTextWallet: null,
  linkBrowser: null,
  linkTitleBrowser: null,
  linkTextBrowser: null,
  color: 'darkGrey',
  hoverColor: 'darkText',
  activeColor: 'ledger',
  buttonText: 'Connect to dapp browser',
};

export { isDappBrowser, detectDappBrowser };
