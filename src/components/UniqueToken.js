import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { lang } from 'balance-common';
import { transitions } from '../styles';

const StyledViewLink = styled.a`
  transition: ${transitions.button};
  position: relative;
  display: inline-block;
  border-style: none;
  box-sizing: border-box;
  background-color: white;
  box-shadow: 0 0 0 1px #bbb, 0 1px 2px rgba(0, 0, 0, 0.07);
  padding: 6px 10px;
  margin: 0;
  color: #757575;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.07);
  font-size: 13px;
  font-weight: 700;
  line-height: 18px;
  letter-spacing: 0.02em;
  vertical-align: middle;
  border: none;
  text-decoration: none;
  border-radius: 4px;
  appearance: none;

  &:hover {
    box-shadow: 0 0 0 1px #bbb, 0 1px 2px rgba(0, 0, 0, 0.07);
    color: #444;
  }
`;

const StyledToken = styled.div`
  font-size: 14px;
  text-align: center;
`;

const StyledToolGroup = styled.div`
  padding: 16px;
  display: flex;
`;

const StyledInfo = styled.div`
  white-space: nowrap;
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-right: 8px;
`;

const StyledName = styled.div`
  font-weight: 500;
  font-size: 13px;
  line-height: 1.3em;
  color: #333;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const StyledPrevPrice = styled.span`
  font-size: 12px;
  line-height: 1em;
  color: #999;
  margin: 0;
  padding: 0;
  border: 0;
  display: block;
`;

const StyledCurPrice = styled.span`
  font-weight: 600;
  width: 65%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  color: #3291e9 !important;
  float: right !important;
  display: block;
  text-align: right;
`;

const StyledCard = styled.div`
  text-align: left;
  background: white;
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
`;

const StyledTokenBackground = styled.div`
  background: ${props => props.background};
`;

const StyledTokenImage = styled.img`
  width: 100%;
  vertical-align: middle;
`;

const UniqueToken = ({ asset }) => (
  <StyledToken>
    <StyledCard>
      <StyledTokenBackground background={asset.background}>
        <StyledTokenImage src={asset.image_preview_url} alt={asset.name} />
      </StyledTokenBackground>
      <StyledToolGroup>
        <StyledInfo>
          <StyledName title={asset.name}>{asset.name}</StyledName>
          {asset.currentPrice && (
            <StyledCurPrice>
              {asset.currentPrice
                ? `${lang.t('time.now')}: ㆔ ${asset.currentPrice}`
                : ' '}
            </StyledCurPrice>
          )}

          <StyledPrevPrice>
            {asset.lastPrice
              ? ` ${lang.t('modal.previous_short')} ㆔ ${asset.lastPrice}`
              : `${lang.t('modal.new')}!`}
          </StyledPrevPrice>
        </StyledInfo>
        <StyledViewLink
          href={`https://opensea.io/assets/${asset.asset_contract.address}/${
            asset.id
          }`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {lang.t('button.view')}
        </StyledViewLink>
      </StyledToolGroup>
    </StyledCard>
  </StyledToken>
);

UniqueToken.propTypes = {
  asset: PropTypes.object.isRequired,
};

export default UniqueToken;
