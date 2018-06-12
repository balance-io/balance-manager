import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Loader from './Loader';
import { tokenGetTokenInfo } from '../reducers/_token';
import { graphAddOpenGraph, graphRemoveOpenGraph } from '../reducers/_graph';
import Graph from './Graph';
import NewsLink from './NewsLink';
import { colors, responsive } from '../styles';

const StyledTokenInfoContainer = styled.div`
  background-color: ${colors.white}
  grid-row-start: 2;
  grid-column-end: span 5;
  text-align: left;
`;

const StyledTokenInfoGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding-top: 20px;
`;

const StyledTokenInfoLeft = styled.div`
  justify-content: flex-start;
  margin-bottom: 10px;
  @media screen and (${responsive.sm.min}) {
    flex: 1 0 50%;
  }
`;

const StyledGraphInfo = styled.div`
  text-align: center;
  margin-bottom: 10px;
  @media screen and (${responsive.sm.min}) {
    flex: 0 1 50%;
  }
`;

const StyledTokenInfoRow = styled.div`
  flex-basis: 100%;
`;

const StyledButton = styled.button`
  font-size: 1rem;
  display: block;
  width: 100%;
  background-color: rgb(${colors.lightGrey});
`;

const StyledHeading = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
`;

const StyledLinksList = styled.ul`
  padding-bottom: 10px;
  & li {
    display: inline-block;

    & i {
      font-size: 1.5rem;
      color: rgb(${colors.darkGrey});
    }
  }
`;

const StyledNewsList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  & li {
    width: 100%;
    display: inline-block;
    margin-bottom: 5px;
    border: 1px solid rgb(${colors.darkGrey});
    @media screen and (${responsive.sm.min}) {
      flex: 0 1 49%;
    }
  }
`;

const StyledText = styled.p`
  padding-bottom: 10px;
  justify-content: flex-start !important;
`;

const StyledDescriptiveList = styled.dl`
  overflow: auto;
  margin: 0 0 10px 0;
  & dt,
  & dd {
    float: left;
  }

  & dt {
    clear: both;
  }
`;

class TokenInfo extends Component {
  constructor(props) {
    super(props);
    this.toggleInfo = this.toggleInfo.bind(this);
    this.state = {
      open: false,
    };
  }

  toggleInfo() {
    const { open } = this.state;
    const {
      token,
      tokenGetTokenInfo,
      graphAddOpenGraph,
      graphRemoveOpenGraph,
    } = this.props;
    if (!open) {
      tokenGetTokenInfo(token.address);
      graphAddOpenGraph(token.symbol);
    } else {
      graphRemoveOpenGraph(token.symbol);
    }

    this.setState({
      open: !open,
    });
  }

  render() {
    const { open } = this.state;
    const { token, tokenInfo } = this.props;

    function renderInfo() {
      if (tokenInfo.error) {
        return (
          <div>
            <StyledText>Could not find info for {token.symbol}</StyledText>
          </div>
        );
      }

      return (
        <StyledTokenInfoGrid>
          <StyledTokenInfoLeft>
            <StyledHeading>General info</StyledHeading>
            <StyledText>{tokenInfo.info.description}</StyledText>

            <StyledHeading>Number of tokens</StyledHeading>
            <StyledText>{tokenInfo.info.token_count}</StyledText>

            <StyledHeading>Number of holders</StyledHeading>
            <StyledText>{tokenInfo.info.num_holders_approx}</StyledText>
          </StyledTokenInfoLeft>
          <StyledGraphInfo>
            <StyledHeading>Price chart</StyledHeading>
            <StyledText>TBA</StyledText>
          </StyledGraphInfo>
          <StyledTokenInfoRow>
            <StyledLinksList>
              {tokenInfo.info.links.map(link => {
                return (
                  <li key={link.title}>
                    <a
                      href={link.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      title={link.title}
                    >
                      <i className={`zmdi ${link.icon} zmdi-hc-fw`} />
                    </a>
                  </li>
                );
              })}
            </StyledLinksList>
            <StyledHeading>Token smart contract:</StyledHeading>
            <StyledDescriptiveList>
              <dt>Address:</dt>
              <dd>{tokenInfo.info.address}</dd>
            </StyledDescriptiveList>
            <StyledHeading>News:</StyledHeading>
            <StyledNewsList>
              {tokenInfo.info.last_posts.map(post => {
                return (
                  <li key={post.title}>
                    <NewsLink post={post} />
                  </li>
                );
              })}
            </StyledNewsList>
          </StyledTokenInfoRow>
        </StyledTokenInfoGrid>
      );
    }

    return (
      <StyledTokenInfoContainer>
        <StyledButton onClick={this.toggleInfo}>
          {open ? 'Hide' : 'Show'} more info
        </StyledButton>
        {open && token.fetching ? (
          <Loader size={20} color="black" background="white" />
        ) : (
          ''
        )}
        {open && !tokenInfo.fetching ? renderInfo() : ''}
      </StyledTokenInfoContainer>
    );
  }
}

const reduxProps = (state, props) => {
  return {
    tokenInfo: state.token[props.token.address],
  };
};

export default connect(
  reduxProps,
  {
    tokenGetTokenInfo,
    graphAddOpenGraph,
    graphRemoveOpenGraph,
  },
)(TokenInfo);
