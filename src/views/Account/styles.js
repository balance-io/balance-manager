import styled from 'styled-components';
import hideIcon from '../../assets/hide-icon.svg';
import showIcon from '../../assets/show-icon.svg';
import { colors, fonts, responsive } from '../../styles';

export const StyledGrid = styled.div`
  width: 100%;
  text-align: right;
  position: relative;
  z-index: 0;
  box-shadow: 0 5px 10px 0 rgba(59, 59, 92, 0.08),
    0 0 1px 0 rgba(50, 50, 93, 0.02), 0 3px 6px 0 rgba(0, 0, 0, 0.06);
`;

export const StyledRow = styled.div`
  width: 100%;
  display: grid;
  position: relative;
  padding: 20px;
  z-index: 0;
  background-color: rgb(${colors.white});
  grid-template-columns: 5fr repeat(4, 4fr);
  min-height: 0;
  min-width: 0;
  & p {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: ${fonts.size.h6};
  }
  &:last-child {
    border-radius: 0 0 10px 10px;
  }
  @media screen and (${responsive.sm.max}) {
    grid-template-columns: 5fr repeat(4, 4fr);
    padding: 16px;
  }
  @media screen and (${responsive.xs.max}) {
    grid-template-columns: 1fr repeat(3, 3fr);
    & p:nth-child(3) {
      display: none;
    }
  }
`;

export const StyledLabelsRow = styled(StyledRow)`
  width: 100%;
  border-width: 0 0 2px 0;
  border-color: rgba(136, 136, 136, 0.03);
  border-style: solid;
  padding: 12px 20px;
  & p:first-child {
    justify-content: flex-start;
  }
`;

export const StyledLabels = styled.p`
  text-transform: uppercase;
  font-size: ${fonts.size.small} !important;
  font-weight: ${fonts.weight.semibold};
  color: rgb(${colors.mediumGrey});
  letter-spacing: 0.46px;
`;

export const StyledEthereum = styled(StyledRow)`
  width: 100%;
  z-index: 2;
  & div p {
    font-weight: ${fonts.weight.medium};
  }
  & > p {
    font-weight: ${fonts.weight.regular};
    font-family: ${fonts.family.SFMono};
  }
  & p:last-child {
    font-weight: ${fonts.weight.medium};
  }
`;

export const StyledToken = styled(StyledRow)`
  width: 100%;
  & > * {
    font-weight: ${fonts.weight.regular};
    color: rgb(${colors.darkText});
  }
  & > p:first-child {
    justify-content: flex-start;
  }
  & > p {
    font-family: ${fonts.family.SFMono};
  }
  &:nth-child(n + 3) {
    border-top: 1px solid rgba(${colors.rowDivider});
  }
`;

export const StyledAsset = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  min-height: 0;
  min-width: 0;
  & p {
    font-size: ${fonts.size.medium};
    margin-left: 10px;
  }
  @media screen and (${responsive.xs.max}) {
    & > img {
      margin-left: 12px;
    }
    & p {
      display: none;
    }
  }
`;

const StyledShowHideIcon = styled.div`
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-left: 5px;
    cursor: pointer;
`;

export const StyledHideIcon = StyledShowHideIcon.extend`
    background: url(${hideIcon}) no-repeat;
`;

export const StyledShowIcon = StyledShowHideIcon.extend`
    background: url(${showIcon}) no-repeat;
`;

export const StyledPercentage = styled.p`
  color: ${({ percentage }) =>
    percentage
      ? percentage > 0
        ? `rgb(${colors.green})`
        : percentage < 0
          ? `rgb(${colors.red})`
          : `inherit`
      : `inherit`};
`;

export const StyledLastRow = styled(StyledRow)`
  width: 100%;
  z-index: 2;
  grid-template-columns: 3fr 1fr;
  min-height: 0;
  min-width: 0;
  border-top: 1px solid rgba(${colors.rowDivider});
  & > p {
    font-size: ${fonts.size.medium};
    font-weight: ${fonts.weight.semibold};
    font-family: ${fonts.family.SFMono};
  }
  & > p:first-child {
    font-family: ${fonts.family.SFProText};
    justify-content: flex-start;
  }
  @media screen and (${responsive.sm.max}) {
    & p {
      font-size: ${fonts.size.h6};
    }
  }
`;

export const StyledShowMoreTokens = styled(StyledToken)`
  grid-template-columns: 100%;
  min-height: 0;
  min-width: 0;
  padding: 0;
  position: relative;
  cursor: pointer;
  text-align: left;
  justify-content: flex-start;
  font-family: ${fonts.family.SFProText};
  font-weight: ${fonts.weight.medium};
  font-size: 13px;
  color: rgb(${colors.grey});
  margin-top: -1px;
  padding-left: 19px;

  @media (hover: hover) {
    &:hover p {
      opacity: 0.7;
    }
  }
`;