import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const proxyModule = buildModule('ProxyModule', (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const name = 'TranslucentUpgradeableProxy';
  const version = '1.0.0';

  const implementationV1 = m.contract('ImplementationV1');
  m.contract('ImplementationV2');
  m.contract('ImplementationV3');

  const proxy = m.contract('MyTransparentProxy', [
    implementationV1,
    name,
    version,
    proxyAdminOwner,
  ]);

  return { proxy };
});

export default proxyModule;
