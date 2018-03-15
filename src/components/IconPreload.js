import React from 'react';
import styled from 'styled-components';
import cryptoIcons from '../cryptocurrency-icons';

const StyledPreload = styled.div`
  position: absolute;
  opacity: 0;
  visibility: hidden;
  transform: translate3d(-10000px, -10000px, 0);
  pointer-events: none;
  z-index: -1;
`;

const IconPreload = () => (
  <StyledPreload>
    {Object.keys(cryptoIcons).map(key => <img key={key} src={cryptoIcons[key]} alt={key} />)}
  </StyledPreload>
);

export default IconPreload;
