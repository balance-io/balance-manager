import React from 'react';
import styled from 'styled-components';
import lang from '../languages';
import OpenSeaLogo from '../assets/opensea-icon.png';

const Container = styled.div`
  text-align: left;
  position: relative;
  width: 100%;
  height: 16%;
  border-top: solid #e1e4e8 1px;
  display: flex;
  flex-direction: row;
`;
const ContainerLogo = styled.div`
  display: flex;
  flex-direction: column;
`;
const TextField = styled.div`
  width: 75%;
  border-right: solid #e1e4e8 1px;
  padding: 20px;
`;
const Header = styled.p`
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 5px;
`;
const Text = styled.p`
  font-size: 0.9rem;
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
  padding-left: 20px;
  padding-top: 20px;
  display: inline;
`;
const Logo = styled.div`
  color: #91939f;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 1.4rem;
  color: #8ec7d1;
  margin-left: 50px;
  padding-top: 10px;
  @media screen and (max-width: 769px) {
    margin-left: 15px;
  }
`;

const Footer = () => (
  <Container>
    <TextField>
      <Header>{lang.t('message.opensea_header')}</Header>
      <Text>
        <Link href="https://opensea.io/">OpenSea</Link>
        {lang.t('message.opensea_footer')}
        <LinkFat href="https://opensea.io/about">
          {lang.t('button.learn_more')}
        </LinkFat>
      </Text>
    </TextField>
    <ContainerLogo>
      <PowerUp>{lang.t('message.power_by')}</PowerUp>
      <Logo>
        <img src={OpenSeaLogo} alt="OpenSea logo" width={35} height={35} />
        <p>OpenSea</p>
      </Logo>
    </ContainerLogo>
  </Container>
);

export default Footer;
