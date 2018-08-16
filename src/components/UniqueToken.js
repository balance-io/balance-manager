import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { lang } from 'balance-common';
import { colors, fonts, shadows, transitions } from '../styles';

const StyledViewLink = styled.a`
  transition: ${transitions.button};
  position: relative;
  border: none;
  display: inline-block;
  border-style: none;
  box-sizing: border-box;
  background-color: ${({ outline, color }) =>
    outline ? 'transparent' : `rgb(${colors[color]})`};
  border: ${({ outline, color }) =>
    outline ? `1px solid rgb(${colors[color]})` : 'none'};
  color: ${({ outline, color }) =>
    outline ? `rgb(${colors[color]})` : `rgb(${colors.white})`};
  box-shadow: ${({ outline }) => (outline ? 'none' : `${shadows.soft}`)};
  border-radius: 8px;
  font-size: ${fonts.size.h6};
  font-weight: ${fonts.weight.semibold};
  padding: ${({ icon, left }) =>
    icon ? (left ? '7px 12px 8px 28px' : '7px 28px 8px 12px') : '8px 12px'};
  height: 32px;
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  will-change: transform;

  &:disabled {
    opacity: 0.6;
    box-shadow: ${({ outline }) => (outline ? 'none' : `${shadows.soft}`)};
  }

  @media (hover: hover) {
    &:hover {
      transform: ${({ disabled }) => (!disabled ? 'translateY(-1px)' : 'none')};
      background-color: ${({ disabled, hoverColor, color }) =>
        !disabled
          ? hoverColor
            ? `rgb(${colors[hoverColor]})`
            : `rgb(${colors[color]})`
          : `rgb(${colors[color]})`};
      box-shadow: ${({ disabled, outline }) =>
        !disabled
          ? outline
            ? 'none'
            : `${shadows.hover}`
          : `${shadows.soft}`};
    }
  }

  &:active {
    transform: ${({ disabled }) => (!disabled ? 'translateY(1px)' : 'none')};
    background-color: ${({ disabled, activeColor, color }) =>
      !disabled
        ? activeColor
          ? `rgb(${colors[activeColor]})`
          : `rgb(${colors[color]})`
        : `rgb(${colors[color]})`};
    box-shadow: ${({ outline }) => (outline ? 'none' : `${shadows.soft}`)};
    color: ${({ outline, color }) =>
      outline ? `rgb(${colors[color]})` : `rgba(${colors.whiteTransparent})`};
  }
`;

const StyledToken = styled.div`
  display: inline-block;
  font-size: 14px;
  padding: 0 10px;
  width: 25%;
  text-align: center;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    width: 50%;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const StyledInfo = styled.div`
  padding: 15px 24px !important;
  line-height: 24px;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledName = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: 800;
`;

const StyledPrevPrice = styled.small`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledCurPrice = styled.span`
  font-weight: 600
  width: 65%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-trasform: uppercase;
  color: #3291e9 !important
  float: right !important;
  display: block;
  text-align: right;
`;

const StyledCard = styled.div`
  text-align: left;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
  background: white;
  margin-bottom: 10px;
`;

const StyledTokenBackground = styled.div`
  background: ${props => props.background};
`;

const StyledTokenImage = styled.img`
  width: 100%;
`;

const UniqueToken = ({
  background,
  imageUrl,
  name,
  lastPrice,
  currentPrice,
  id,
  contractAddress,
}) => (
  <StyledToken>
    <StyledCard>
      <StyledTokenBackground background={background}>
        <StyledTokenImage src={imageUrl} alt={name} />
      </StyledTokenBackground>
      <StyledInfo>
        <StyledName>
          {name} • #{id}
        </StyledName>
        <StyledCurPrice>
          {currentPrice ? `${lang.t('time.now')}: ㆔ ${currentPrice}` : ' '}
        </StyledCurPrice>
        <StyledPrevPrice>
          {lastPrice
            ? ` ${lang.t('modal.previous_short')} ㆔ ${lastPrice}`
            : `${lang.t('modal.new')}!`}
        </StyledPrevPrice>
      </StyledInfo>
    </StyledCard>
    <StyledViewLink
      href={`https://opensea.io/assets/${contractAddress}/${id}`}
      color="blue"
      hoverColor="blueHover"
      activeColor="blueActive"
      left
      target="_blank"
      rel="noopener noreferrer"
    >
      {lang.t('button.view')}
    </StyledViewLink>
  </StyledToken>
);

UniqueToken.propTypes = {
  background: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  lastPrice: PropTypes.number,
  currentPrice: PropTypes.number,
  id: PropTypes.string.isRequired,
  contractAddress: PropTypes.string.isRequired,
};

export default UniqueToken;
