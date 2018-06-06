import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import lang from '../../languages';
import AssetIcon from '../../components/AssetIcon';
import ToggleIndicator from '../../components/ToggleIndicator';
import Footer from '../../components/Footer';

import { ellipseText } from '../../helpers/utilities';
import { fetchUniqueTokens } from '../../handlers/opensea-api';
import { colors, fonts, responsive } from '../../styles';

const StyledGrid = styled.div`
  width: 100%;
  text-align: right;
  position: relative;
  z-index: 0;
  box-shadow: 0 5px 10px 0 rgba(59, 59, 92, 0.08),
    0 0 1px 0 rgba(50, 50, 93, 0.02), 0 3px 6px 0 rgba(0, 0, 0, 0.06);
`;

const Container = styled.div`
  min-height: 79%;
  position: relative;
`;

const OPEN_SEA_API = 'https://api.opensea.io/api/v1/assets?owner=';

class ShowAccountUniqueTokens extends Component {
  state = {
    disableToggle: false,
    showMoreTokens: false,
    kitties: [],
  };

  UNSAFE_componentWillMount = () => {
    console.log(fetchUniqueTokens(this.props.accountAddress));
  };

  // onShowMoreTokens = () => {
  //   this.setState({ showMoreTokens: !this.state.showMoreTokens });
  // };

  render() {
    if (!this.props.accountAddress) return null;
    return (
      <StyledGrid>
        <Container />
        <Footer />
      </StyledGrid>
    );
  }
}

ShowAccountUniqueTokens.propTypes = {
  accountAddress: PropTypes.string.isRequired,
  accountInfo: PropTypes.object.isRequired,
};

const reduxProps = ({ account }) => ({
  accountAddress: account.accountAddress,
  accountInfo: account.accountInfo,
});

export default connect(reduxProps, null)(ShowAccountUniqueTokens);
