import styled from 'styled-components';

import Button from '../components/Button';

import { fonts, colors } from '../styles';

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
  right: 22px;
  bottom: 0;
  width: 43px;
  border-radius: 0 8px 8px 0;
  height: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
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
`;

export const StyledAmountCurrency = styled.div`
  position: absolute;
  bottom: 10px;
  right: 6px;
  padding: 4px;
  border-radius: 6px;
  background: rgb(${colors.white});
  font-size: ${fonts.size.medium};
  color: rgba(${colors.darkGrey}, 0.7);
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
`;

export const StyledConversionIcon = styled.div`
  width: 46px;
  position: relative;
  & img {
    width: 15px;
    position: absolute;
    bottom: 12px;
    left: calc(50% - 10px);
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
  width: 100%;
  & ${StyledIcon} {
    margin-right: 5px;
  }
`;

export const StyledInvalidAddress = styled.p`
  position: absolute;
  top: 0;
  right: 0;
  margin: 22px;
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
  justify-content: ${({ single }) => (single ? `center` : `space-between`)};
  & button {
    margin: 0 5px;
  }
`;
