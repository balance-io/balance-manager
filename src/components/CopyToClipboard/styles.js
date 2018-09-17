import styled, { css } from 'styled-components';

import { fonts, colors, transitions, responsive } from '../../styles';

const StyledInputTextSize = `
  font-size: ${fonts.size.medium};
  max-width: 400px;
`;

const StyledInputTextSizeSMedium = `
  font-size: ${fonts.size.smedium};
  max-width: 370px;
`;

const StyledInputTextSizeSmall = `
  font-size: ${fonts.size.small};
  max-width: 320px;
`;

const StyledInputTextSizeXSmall = `
  font-size: ${fonts.size.xsmall};
  max-width: 294px;
`;

const StyledIcon = styled.img`
  cursor: pointer;
  transition: ${transitions.base};
  width: 16px;
  height: 16px;
  opacity: 0;
  vertical-align: middle;
  display: ${({ displayIcon }) => (displayIcon ? 'inline' : 'none')};

  @media screen and (${responsive.xxs.max}) {
    display: none;
  }
`;

const StyledText = styled.p`
  transition: ${transitions.base};
  font-weight: ${fonts.weight.medium};
  font-size: ${fonts.size.small};
  opacity: 0;
  position: absolute;
  top: 200%;
  right: calc(50% - 91px);
  font-family: ${fonts.family.SFMono};
  letter-spacing: -0.2px;
`;

const StyledCopyToClipboard = styled.div`
  @media (hover: hover) {
    &:hover ${StyledIcon} {
      opacity: ${({ iconOnHover }) => (iconOnHover ? '1' : '0')};
    }
    &:hover ${StyledText} {
      opacity: ${({ iconOnHover }) => (iconOnHover ? '0' : '0.7')};
    }
  }
`;

const StyledInputText = styled.input`
  background-color: transparent;
  color: transparent;
  text-shadow: 0 0 0 rgb(${colors.mediumGrey});
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  font-weight: ${fonts.weight.medium};
  font-family: ${fonts.family.SFMono};
  line-height: 1.25;
  width: 100%;
  ${StyledInputTextSize};

  ${({ isTopAddress }) =>
    isTopAddress &&
    css`
      @media screen and (max-width: 810px) {
        ${StyledInputTextSizeSMedium};
      }

      @media screen and (max-width: 780px) {
        ${StyledInputTextSizeSmall};
      }

      @media screen and (max-width: 730px) {
        ${StyledInputTextSizeXSmall};
      }

      @media screen and (max-width: 712px) {
        ${StyledInputTextSize};
      }
    `};

  @media screen and (${responsive.xs.max}) {
    ${StyledInputTextSizeSMedium};
  }

  @media screen and (max-width: 450px) {
    ${StyledInputTextSizeSmall};
  }

  @media screen and (max-width: 360px) {
    ${StyledInputTextSizeXSmall};
  }

  @media screen and (max-width: 336px) {
    font-size: ${fonts.size.tiny};
  }
`;

const StyledInput = styled(StyledInputText)`
  -webkit-appearance: none;
  border: none;
  cursor: pointer;
  display: inline-block;
  outline: none;
  vertical-align: middle;
`;

export { StyledCopyToClipboard, StyledInput, StyledText, StyledIcon };
