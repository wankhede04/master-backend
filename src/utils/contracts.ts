import { ethers, Contract } from 'ethers';
import positioningAbi from '../abis/Positioning.json';
import accountBalanceAbi from '../abis/AccountBalance.json';
import config from '../config';

export const provider = new ethers.providers.AlchemyProvider(
  config.NETWORK,
  config.ALCHEMY_API_KEY,
);
export const getPositioning = (): Contract => {
  const positioningContract = new ethers.Contract(
    `${config.POSITIONING_CONTRACT_ADDRESS}`,
    positioningAbi,
    provider,
  );
  return positioningContract;
};

export const getAccountBalance = (): Contract => {
  const accountBalance = new ethers.Contract(
    `${config.ACCOUNT_BALANCE_ADDRESS}`,
    accountBalanceAbi,
    provider,
  );
  return accountBalance;
};
