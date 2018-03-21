import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import iconIndex from '../cryptocurrency-icons';

const StyledIcon = styled.img`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
`;

const AssetIcon = ({ currency, size, ...props }) => {
  const icon = iconIndex[currency.split(' ')[0].toLowerCase()] || iconIndex['erc20'];
  return <StyledIcon size={size} src={icon} />;
};

AssetIcon.propTypes = {
  currency: PropTypes.string.isRequired,
  size: PropTypes.number
};

AssetIcon.defaultProps = {
  size: 20
};

export default AssetIcon;
