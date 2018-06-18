import React, { Component } from 'react';
import styled from 'styled-components';
import NewsLink from './NewsLink';
import { colors, responsive, fonts } from '../styles';
import lang from '../languages';

const StyledTokenDetailsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
  text-align: left;
`;

const StyledTokenDetails = styled.div`
  flex: 1 0 100%;
  @media screen and (${responsive.sm.min}) {
    flex: 1 0 50%;
  }
`;

const StyledTokenDetailsLeft = styled(StyledTokenDetails)`
  @media screen and (${responsive.sm.min}) {
    padding-right: 5px;
  }
`;

const StyledTokenDetailsRight = styled(StyledTokenDetails)`
  @media screen and (${responsive.sm.min}) {
    padding-left: 5px;
  }
`;

const StyledTokenDetailsRow = styled.div`
  flex-basis: 100%;
`;

const StyledHeading = styled.h3`
  font-size: ${fonts.size.small};
  font-weight: ${fonts.weight.bold};
  margin-bottom: 4px;
`;

const StyledText = styled.p`
  font-size: ${fonts.size.small}
  padding-bottom: 10px;
`;

const StyledUnknown = styled(StyledText)`
  color: ${colors.lightGrey};
  opacity: 0.3;
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
  }
`;

class TokenDetails extends Component {
  render() {
    const { tokenDetails, showTokenDetails } = this.props;

    if (!showTokenDetails) return '';
    return (
      <StyledTokenDetailsGrid>
        <StyledTokenDetailsLeft>
          {tokenDetails.description ? (
            <div>
              <StyledHeading>
                {lang.t('account.details.general_info')}
              </StyledHeading>
              <StyledText>{tokenDetails.description}</StyledText>
            </div>
          ) : (
            ''
          )}

          {tokenDetails.token_count ? (
            <div>
              <StyledHeading>
                {lang.t('account.details.number_of_tokens')}
              </StyledHeading>
              <StyledText>{tokenDetails.token_count}</StyledText>
            </div>
          ) : (
            ''
          )}

          {tokenDetails.num_holders_approx ? (
            <div>
              <StyledHeading>
                {lang.t('account.details.number_of_holders')}
              </StyledHeading>
              <StyledText>{tokenDetails.num_holders_approx}</StyledText>
            </div>
          ) : (
            ''
          )}
        </StyledTokenDetailsLeft>
        <StyledTokenDetailsRight>
          {tokenDetails.address ? (
            <div>
              <StyledHeading>
                {lang.t('account.details.smart_contract')}
              </StyledHeading>
              <StyledText>{tokenDetails.address}</StyledText>
            </div>
          ) : (
            ''
          )}

          {tokenDetails.links ? (
            <StyledLinksList>
              {tokenDetails.links.map(link => {
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
          ) : (
            ''
          )}
        </StyledTokenDetailsRight>
        <StyledTokenDetailsRow>
          {tokenDetails.last_posts.length > 0 ? (
            <div>
              <StyledHeading>{lang.t('account.details.news')}</StyledHeading>
              <StyledNewsList>
                {tokenDetails.last_posts.map(post => {
                  return (
                    <li key={post.title}>
                      <NewsLink post={post} />
                    </li>
                  );
                })}
              </StyledNewsList>
            </div>
          ) : (
            ''
          )}
        </StyledTokenDetailsRow>
      </StyledTokenDetailsGrid>
    );
  }
}

export default TokenDetails;
