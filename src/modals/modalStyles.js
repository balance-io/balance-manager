import styled from 'styled-components';

import Button from '../components/Button';
import CopyToClipboard from '../components/CopyToClipboard';
import QRCodeDisplay from '../components/QRCodeDisplay';

import { fonts, colors, responsive } from '../styles';

export const StyledSuccessMessage = styled.div`
  width: 100%;
  padding: 22px;
  & a {
    text-decoration: underline;
    font-weight: ${fonts.weight.semibold};
  }
  & > *:nth-child(n + 2) {
    margin-top: 24px;
  }
`;

export const StyledIcon = styled.div`
  width: 14px;
  height: 14px;
  transform: ${({ rotation }) =>
    rotation ? `rotate(${rotation}deg)` : 'rotate(0deg)'};
  mask: ${({ icon }) => (icon ? `url(${icon}) center no-repeat` : 'none')};
  mask-size: 90%;
  background-color: ${({ color }) =>
    color ? `rgb(${colors[color]})` : `rgb(${colors.dark})`};
`;

export const StyledFlex = styled.div`
  display: flex;
  position: relative;
  transform: none;
`;

export const StyledBottomModal = styled(StyledFlex)`
  & p {
    font-size: ${fonts.size.h6};
  }
  & > * {
    width: 100%;
  }
`;

export const StyledParagraph = styled.p`
  margin: 10px 0;
  color: rgb(${colors.grey});
  font-weight: ${fonts.weight.medium};
`;

export const StyledHash = styled.p`
  font-size: ${fonts.size.small};
  font-weight: 600;
  text-align: center;
  letter-spacing: -0.4px;
  background: rgb(${colors.white});
  border-radius: 8px;
  margin: 0 auto;
  padding: 12px 18px;
`;

export const StyledGasButton = styled(Button)`
  width: 100%;
  height: 54px;
  & p {
    margin-top: 2px;
  }
  & p:first-child {
    font-weight: 500;
  }
  & p:last-child {
    font-weight: 400;
    font-size: 12px;
  }
  &:hover,
  &:active,
  &:focus,
  &:disabled {
    outline: none !important;
    box-shadow: none !important;
  }
`;

export const StyledQRIcon = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  height: 43px;
  width: 43px;
  padding: 12px;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  background-color: rgb(${colors.lightGrey});

  & img {
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }

  @media (hover: hover) {
    &:hover {
      opacity: 0.6;
    }
  }

  @media screen and (${responsive.sm.max}) {
    height: 35px;
    width: 35px;
    padding: 8px;
  }
`;

export const StyledInputContainer = styled(StyledFlex)`
  position: relative;
  flex-grow: 1;
`;

export const StyledAmountCurrency = styled.div`
  position: absolute;
  bottom: 8px;
  right: 6px;
  padding: 4px;
  border-radius: 6px;
  background: rgb(${colors.white});
  font-size: ${fonts.size.medium};
  color: rgba(${colors.darkGrey}, 0.7);
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};

  @media screen and (${responsive.sm.max}) {
    bottom: 4px;
  }
`;

export const StyledConversionContainer = styled(StyledFlex)`
  @media screen and (${responsive.xs.max}) {
    flex-direction: column;
  }
`;

export const StyledConversionIconContainer = styled(StyledFlex)`
  align-items: center;
  align-self: flex-end;
  height: 43px;
  margin: 0 auto;

  @media screen and (${responsive.sm.max}) {
    height: 35px;
  }

  @media screen and (${responsive.xs.max}) {
    height: inherit;
    align-self: inherit;
    justify-content: center;
  }
`;

export const StyledConversionIcon = styled.img`
  height: 15px;
  width: 15px;
  margin: 0 16px;

  @media screen and (${responsive.xs.max}) {
    margin: 16px 0 12px;
  }
`;

export const StyledGasOptions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0;
  & button {
    background-color: transparent;
    box-shadow: none;
    color: rgb(${colors.darkGrey});
    height: 64px;
    margin: 0;
    border-radius: 0;
    &:hover,
    &:active,
    &:focus {
      box-shadow: none !important;
      outline: none !important;
      background-color: transparent !important;
      color: rgb(${colors.darkGrey}) !important;
    }
  }
`;

export const StyledSubTitle = styled.div`
  display: flex;
  align-items: center;
  color: rgb(${colors.grey});
  font-size: ${fonts.size.h6};
  font-weight: ${fonts.weight.semibold};

  &:not(:last-child) {
    margin-right: 16px;
  }

  & ${StyledIcon} {
    margin-right: 8px;
  }
`;

export const StyledInvalidAddress = styled.p`
  position: absolute;
  top: 0;
  right: 0;
  line-height: 1.8em;
  font-size: ${fonts.size.small};
  font-weight: ${fonts.weight.medium};
  color: rgba(${colors.red});
  @media (hover: hover) {
    &:hover {
      opacity: 0.6;
    }
  }
`;

export const StyledMaxBalance = styled.p`
  position: absolute;
  cursor: pointer;
  top: 0;
  right: 0;
  line-height: 1.8em;
  font-size: ${fonts.size.small};
  font-weight: ${fonts.weight.medium};
  color: rgba(${colors.blue}, 0.8);
  @media (hover: hover) {
    &:hover {
      opacity: 0.6;
    }
  }
`;

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: ${({ single }) => (single ? `center` : `space-between`)};

  & button {
    margin: 0 5px;
  }

  @media screen and (${responsive.xs.max}) {
    p {
      order: 1;
      width: 100%;
      margin: 0 auto 8px;
      text-align: center;
    }

    button {
      &:first-child {
        order: 2;
      }

      &:last-child {
        order: 3;
      }
    }
  }

  @media screen and (${responsive.xxs.max}) {
    p {
      margin: 0 auto 16px;
    }
  }
`;

export const StyledContainer = styled.div`
  width: 100%;
  padding: 16px;

  @media screen and (${responsive.sm.max}) {
    & h4 {
      margin: 20px auto;
    }
  }

  @media screen and (${responsive.xs.max}) {
    padding: 8px;
  }
`;

export const StyledQRCodeDisplay = styled(QRCodeDisplay)`
  margin: 16px auto;
`;

export const StyledJustifyContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StyledCopyToClipboard = styled(CopyToClipboard)`
  font-weight: ${fonts.weight.semibold};
  text-align: center;
  letter-spacing: 2px;
  background: rgb(${colors.white});
  border-radius: 8px;
  margin: 16px auto 0;
  padding: 12px 0;

  & input {
    color: transparent;
    max-width: inherit;
    text-align: center;
    text-shadow: 0 0 0 rgba(${colors.darkGrey});
  }
`;
