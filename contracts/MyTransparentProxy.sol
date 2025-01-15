// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/Proxy.sol";
// import "./TranslucentUpgradeableProxyV1.sol";
import "./TranslucentUpgradeableProxyV2.sol";
import "./Implementation.sol";

contract MyTransparentProxy is
  Proxy,
  TranslucentUpgradeableProxyV2,
  ImplementationStorage
{
  constructor(
    address initialImplementation,
    string memory name,
    string memory version,
    address owner
  ) TranslucentUpgradeableProxyV2(name, version) Proxy() Ownable(owner) {
    upgradeTo(initialImplementation);
  }

  receive() external payable {}

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

  function _implementation() internal view override returns (address) {
    return _getVersionToImplementation(_getCurrentVersion());
  }

  function upgradeTo(address newImplementation) public override onlyOwner {
    super.upgradeTo(newImplementation);
  }

  // function delegate(address implementation) public {
  //   _delegate(implementation);
  // }

  fallback() external payable override notOwner requiresAcknowledgment {
    _delegate(_implementation());
  }
}
