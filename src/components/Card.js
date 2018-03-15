import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Loader from '../components/Loader';
import { colors, fonts, shadows, transitions } from '../styles';

const StyledCard = styled.div`
  transition: ${transitions.base};
  position: relative;
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : 'none')};
  border: none;
  border-style: none;
  color: rgb(${colors.dark});
  background-color: ${({ background }) => `rgb(${colors[background]})`};
  box-shadow: ${shadows.soft};
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  font-weight: ${fonts.weight.normal};
  margin: 0 auto;
  text-align: left;
`;

const StyledContent = styled.div`
  transition: ${transitions.base};
  opacity: ${({ fetching }) => (fetching ? 0 : 1)};
  visibility: ${({ fetching }) => (fetching ? 'hidden' : 'visible')};
  pointer-events: ${({ fetching }) => (fetching ? 'none' : 'auto')};
`;

const StyledFetching = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${transitions.short};
  opacity: ${({ fetching }) => (fetching ? 1 : 0)};
  visibility: ${({ fetching }) => (fetching ? 'visible' : 'hidden')};
  pointer-events: ${({ fetching }) => (fetching ? 'auto' : 'none')};
`;

const Card = ({ fetching, background, maxWidth, children, ...props }) => (
  <StyledCard background={background} maxWidth={maxWidth} {...props}>
    <StyledFetching fetching={fetching}>
      <Loader color="darkGrey" background={background} />
    </StyledFetching>
    <StyledContent fetching={fetching}>{children}</StyledContent>
  </StyledCard>
);

Card.propTypes = {
  children: PropTypes.node.isRequired,
  fetching: PropTypes.bool,
  background: PropTypes.string,
  maxWidth: PropTypes.number
};

Card.defaultProps = {
  fetching: false,
  background: 'white',
  maxWidth: 600
};

export default Card;
