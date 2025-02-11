import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-ignition-ethers';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: 'https://ethereum-sepolia-rpc.publicnode.com',
      accounts: [
        // Test Account: 91bdcd57bc7bb18114c37b781bfb16ea2b3aee55d075e2d7229620c00de753ce
        // Change this to your private key if you want to use your account (not recommended)
        '91bdcd57bc7bb18114c37b781bfb16ea2b3aee55d075e2d7229620c00de753ce',
      ],
    },
    hardhat: {
      mining: {
        auto: true,
        interval: 2000,
      },
      allowBlocksWithSameTimestamp: true,
    },
  },
};

export default config;
