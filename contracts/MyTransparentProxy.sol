// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./TranslucentUpgradeableProxy.sol";
import "./Implementation.sol";

contract MyTransparentProxy is
  TranslucentUpgradeableProxy,
  ImplementationStorage
{
  constructor(
    address initialImplementation,
    string memory name,
    string memory version,
    address owner
  ) TranslucentUpgradeableProxy(name, version, owner) Proxy() {
    upgradeTo(initialImplementation);
  }

  function getUserAcknowledgedVersion(
    address user
  ) public view returns (uint256) {
    return _getUserAcknowledgedVersion(user);
  }

  function getVersionToImplementation(
    uint256 version
  ) public view returns (address) {
    return _getVersionToImplementation(version);
  }

  function implementation() public view returns (address) {
    return _implementation();
  }

  function getCurrentVersion() public view returns (uint256) {
    return _getCurrentVersion();
  }
}
