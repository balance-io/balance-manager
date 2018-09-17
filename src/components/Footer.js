import React from 'react';
import styled from 'styled-components';
import { lang } from 'balance-common';
import OpenSeaLogo from '../assets/opensea-logo.svg';
import { fonts, responsive } from '../styles';

const Container = styled.div`
  border-top: solid #e1e4e8 1px;
  display: flex;

  @media screen and (${responsive.sm.max}) {
    flex-direction: column-reverse;
  }
`;

const ContainerLogo = styled.div`
  border-left: solid #e1e4e8 1px;
  display: flex;
  flex-basis: 25%;
  flex-direction: column;
  justify-content: center;
  padding: 20px;

  @media screen and (${responsive.sm.max}) {
    border-left: none;
    flex-basis: 100%;
    padding-bottom: 0;
  }
`;

const TextField = styled.div`
  padding: 20px;
  width: 75%;

  @media screen and (${responsive.sm.max}) {
    width: 100%;
  }
`;

const Header = styled.p`
  font-size: ${fonts.size.large};
  font-weight: 500;
  margin-bottom: 5px;
`;

const Text = styled.p`
  font-size: ${fonts.size.medium};
  line-height: 24px;
`;

const Link = styled.a`
  color: #6783e0;
`;

const LinkFat = styled.a`
  color: #6783e0;
  font-weight: bold;
`;

const PowerUp = styled.div`
  margin: 0;
  font-weight: 500;
  color: #91939f;
  padding-bottom: 10px;
  display: inline;
`;

const Footer = () => (
  <Container>
    <TextField>
      <Header>{lang.t('message.opensea_header')}</Header>
      <Text>
        <Link
          href="https://opensea.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenSea
        </Link>
        {lang.t('message.opensea_footer')}
        <LinkFat
          href="https://opensea.io/about"
          target="_blank"
          rel="noopener noreferrer"
        >
          {lang.t('button.learn_more')}
        </LinkFat>
      </Text>
    </TextField>
    <ContainerLogo>
      <PowerUp>{lang.t('message.power_by')}</PowerUp>
      <img src={OpenSeaLogo} alt="OpenSea Logo" width={150} />
    </ContainerLogo>
  </Container>
);

export default Footer;
