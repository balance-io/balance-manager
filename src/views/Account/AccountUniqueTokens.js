import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { lang } from 'balance-common';
import Card from '../../components/Card';
import Footer from '../../components/Footer';
import UniqueToken from '../../components/UniqueToken';
import { colors, fonts } from '../../styles';

const UniqueTokensContainer = styled.div`
  background: #ffffff;
`;

const StyledContainer = styled.div`
  background: #f7f8fc;
  border: 2px solid #e2e2e2;
  border-radius: 15px;
  padding: 20px 10px 0px;
  margin: 15px;
`;

const StyledCard = styled(Card)`
  box-shadow: none;
  padding: 0 16px;
`;

const StyledMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(${colors.grey});
  font-weight: ${fonts.weight.medium};
`;

class AccountUniqueTokens extends Component {
  render() {
    const { uniqueTokens } = this.props;
    if (!uniqueTokens) return null;

    return !!uniqueTokens.length ? (
      !this.props.fetchingUniqueTokens ? (
        <UniqueTokensContainer>
          <StyledContainer>
            {uniqueTokens.map(token => (
              <UniqueToken {...token} key={token.id} />
            ))}
          </StyledContainer>
          <Footer />
        </UniqueTokensContainer>
      ) : (
        <StyledCard minHeight={280} fetching={this.props.fetchingUniqueTokens}>
          <StyledMessage>{lang.t('message.failed_request')}</StyledMessage>
        </StyledCard>
      )
    ) : (
      <StyledCard minHeight={280} fetching={this.props.fetchingUniqueTokens}>
        <StyledMessage>{lang.t('message.no_unique_tokens')}</StyledMessage>
      </StyledCard>
    );
  }
}

AccountUniqueTokens.propTypes = {
  uniqueTokens: PropTypes.array.isRequired,
  fetchingUniqueTokens: PropTypes.bool.isRequired,
};
const reduxProps = ({ account }) => ({
  uniqueTokens: account.uniqueTokens,
  fetchingUniqueTokens: account.fetchingUniqueTokens,
});

export default connect(
  reduxProps,
  null,
)(AccountUniqueTokens);
