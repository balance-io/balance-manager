import React, { Component } from 'react';
import Card from '../../components/Card';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  box-shadow: none;
`;

class AccountLoans extends Component {
  render() {
    return (
      <div className="account-loans">
        <StyledCard minHeight={280}>Placeholder</StyledCard>
      </div>
    );
  }
}

export default AccountLoans;
