import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { responsive } from '../styles';

const StyledForm = styled.form`
  width: 100%;
  display: block;

  & > * {
    padding: 16px 16px 0;
  }

  & > *:last-child {
    padding: 16px;
  }

  @media screen and (${responsive.xs.max}) {
    & > * {
      padding: 16px 8px 0;
    }

    & > *:last-child {
      padding: 16px 8px;
    }
  }
`;

class Form extends Component {
  componentWillUnmount() {
    document.activeElement.blur();
  }
  render = () => {
    const { children, ...props } = this.props;
    return (
      <StyledForm noValidate {...props}>
        {children}
      </StyledForm>
    );
  };
}

Form.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Form;
