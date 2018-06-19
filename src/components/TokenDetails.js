import React, { Component } from 'react';
import styled from 'styled-components';
import NewsLink from './NewsLink';
import { colors, responsive, fonts } from '../styles';
import lang from '../languages';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

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
  display: flex;
  flex-wrap: wrap;
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

const StyledPriceChartContainer = styled.div`
  height: 150px;
  width: 100%;
  margin-bottom: 20px;
`;

const StyledDailyActiveChartContainer = styled.div`
  height: 200px;
  width: 100%;
  margin-bottom: 20px;
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
          {tokenDetails.info.description ? (
            <div>
              <StyledHeading>
                {lang.t('account.details.general_info')}
              </StyledHeading>
              <StyledText>{tokenDetails.info.description}</StyledText>
            </div>
          ) : (
            ''
          )}

          {tokenDetails.info.token_count ? (
            <div>
              <StyledHeading>
                {lang.t('account.details.number_of_tokens')}
              </StyledHeading>
              <StyledText>{tokenDetails.info.token_count}</StyledText>
            </div>
          ) : (
            ''
          )}

          {tokenDetails.info.num_holders_approx ? (
            <div>
              <StyledHeading>
                {lang.t('account.details.number_of_holders')}
              </StyledHeading>
              <StyledText>{tokenDetails.info.num_holders_approx}</StyledText>
            </div>
          ) : (
            ''
          )}

          {tokenDetails.info.address ? (
            <div>
              <StyledHeading>
                {lang.t('account.details.smart_contract')}
              </StyledHeading>
              <StyledText>{tokenDetails.info.address}</StyledText>
            </div>
          ) : (
            ''
          )}

          {tokenDetails.info.links ? (
            <StyledLinksList>
              {tokenDetails.info.links.map(link => {
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
        </StyledTokenDetailsLeft>
        <StyledTokenDetailsRight>
          {tokenDetails.price_by_day ? (
            <StyledPriceChartContainer>
              <StyledHeading>
                {lang.t('account.details.price_chart')}
              </StyledHeading>
              <ResponsiveContainer>
                <BarChart data={tokenDetails.price_by_day}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <Bar
                    dataKey="price"
                    fill={`rgb(${colors.grey})`}
                    label={{ position: 'top', fontSize: 10 }}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </StyledPriceChartContainer>
          ) : (
            ''
          )}

          {tokenDetails.daily_active ? (
            <StyledDailyActiveChartContainer>
              <StyledHeading>
                {lang.t('account.details.daily_active')}
              </StyledHeading>
              <ResponsiveContainer>
                <BarChart data={tokenDetails.daily_active}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <Bar
                    dataKey="active"
                    fill={`rgb(${colors.grey})`}
                    label={{
                      position: 'top',
                      fontSize: 10,
                      angle: -90,
                      offset: 20,
                    }}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </StyledDailyActiveChartContainer>
          ) : (
            ''
          )}
        </StyledTokenDetailsRight>
        <StyledTokenDetailsRow>
          {tokenDetails.info.last_posts.length > 0 ? (
            <div>
              <StyledHeading>{lang.t('account.details.news')}</StyledHeading>
              <StyledNewsList>
                {tokenDetails.info.last_posts.map(post => {
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
