// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

abstract contract TranslucentUpgradeableStorage {
  // Unstructured storage slots
  bytes32 internal constant CURRENT_VERSION_SLOT =
    keccak256("translucent.proxy.currentVersion");

  bytes32 internal constant ACKNOWLEDGMENT_TYPEHASH =
    keccak256("Acknowledgment(address user,uint256 newVersion,string message)");

  mapping(address => uint256) internal userAcknowledgedVersion;
  mapping(uint256 => address) internal versionToImplementation;

  // ================= Unstructured Storage Getters/Setters =================
  function _getCurrentVersion() internal view returns (uint256) {
    return _loadUint256(CURRENT_VERSION_SLOT);
  }

  function _setCurrentVersion(uint256 version) internal {
    _storeUint256(CURRENT_VERSION_SLOT, version);
  }

  function _getVersionToImplementation(
    uint256 version
  ) internal view returns (address) {
    return versionToImplementation[version];
  }

  function _setVersionToImplementation(uint256 version, address impl) internal {
    versionToImplementation[version] = impl;
  }

  function _getUserAcknowledgedVersion(
    address user
  ) internal view returns (uint256) {
    return userAcknowledgedVersion[user];
  }

  // ================= Unstructured Storage Utilities =================
  function _loadUint256(bytes32 slot) internal view returns (uint256 value) {
    assembly {
      value := sload(slot)
    }
  }

  function _storeUint256(bytes32 slot, uint256 value) internal {
    assembly {
      sstore(slot, value)
    }
  }
}

abstract contract TranslucentUpgradeableProxy is
  Ownable,
  EIP712,
  Proxy,
  TranslucentUpgradeableStorage
{
  using ECDSA for bytes32;

  event VersionAcknowledged(address indexed user, uint256 version);
  event Upgraded(address indexed newImplementation, uint256 newVersion);

  constructor(
    string memory name,
    string memory version,
    address owner
  ) EIP712(name, version) Ownable(owner) {
    _setCurrentVersion(0);
  }

  modifier notOwner() {
    require(msg.sender != owner(), "Owner cannot call this function");
    _;
  }

  function _implementation() internal view override returns (address) {
    return _getVersionToImplementation(_getCurrentVersion());
  }

  modifier requiresAcknowledgment() {
    uint256 currentVersion = _getCurrentVersion();
    if (userAcknowledgedVersion[msg.sender] != currentVersion) {
      string memory errorMessage = string(abi.encodePacked(_getMessage()));

      revert(
        string(
          abi.encodePacked(
            "ERROR_CODE_1: Please acknowledge the new version! ",
            errorMessage
          )
        )
      );
    }
    _;
  }

  function acknowledgeVersion(bytes memory signature) public notOwner {
    uint256 currentVersion = _getCurrentVersion();

    if (userAcknowledgedVersion[msg.sender] >= currentVersion) {
      _delegate(_implementation());
    }

    require(
      _verifyAcknowledgment(
        msg.sender,
        currentVersion,
        _getMessage(),
        signature
      ),
      "Invalid acknowledgment"
    );

    userAcknowledgedVersion[msg.sender] = currentVersion;
    emit VersionAcknowledged(msg.sender, currentVersion);
  }

  function upgradeTo(address newImplementation) public virtual onlyOwner {
    require(newImplementation != address(0), "Invalid implementation address");
    uint256 newVersion = _getCurrentVersion() + 1;
    _setCurrentVersion(newVersion);
    _setVersionToImplementation(newVersion, newImplementation);
    emit Upgraded(newImplementation, newVersion);
  }

  // ================= EIP-712 Helpers =================
  function _getMessage() internal view returns (string memory) {
    string memory userAcknowledgedContractEtherscan = string(
      abi.encodePacked(
        "(https://sepolia.etherscan.io/address/0x",
        bytesToHex(
          abi.encodePacked(
            _getVersionToImplementation(userAcknowledgedVersion[msg.sender])
          )
        ),
        "#code)"
      )
    );
    string memory currentContractEtherscan = string(
      abi.encodePacked(
        "(https://sepolia.etherscan.io/address/0x",
        bytesToHex(
          abi.encodePacked(_getVersionToImplementation(_getCurrentVersion()))
        ),
        "#code)"
      )
    );
    return
      string(
        abi.encodePacked(
          "You are currently on version ",
          Strings.toString(userAcknowledgedVersion[msg.sender]),
          " ",
          userAcknowledgedContractEtherscan,
          ". The newest version is version ",
          Strings.toString(_getCurrentVersion()),
          " ",
          currentContractEtherscan,
          ". Please sign this message to confirm the upgrade."
        )
      );
  }

  function _verifyAcknowledgment(
    address user,
    uint256 version,
    string memory message,
    bytes memory signature
  ) internal view returns (bool) {
    bytes32 structHash = keccak256(
      abi.encode(
        ACKNOWLEDGMENT_TYPEHASH,
        user,
        version,
        keccak256(bytes(message))
      )
    );
    bytes32 digest = _hashTypedDataV4(structHash);
    address signer = digest.recover(signature);

    return signer == user;
  }

  fallback() external payable override notOwner requiresAcknowledgment {
    _delegate(_implementation());
  }

  receive() external payable notOwner requiresAcknowledgment {
    _delegate(_implementation());
  }

  // Utility functions
  function bytesToHex(
    bytes memory _bytes
  ) internal pure returns (string memory) {
    bytes memory hexChars = "0123456789abcdef";
    bytes memory hexString = new bytes(_bytes.length * 2);

    for (uint i = 0; i < _bytes.length; i++) {
      hexString[i * 2] = hexChars[uint8(_bytes[i] >> 4)];
      hexString[i * 2 + 1] = hexChars[uint8(_bytes[i] & 0x0F)];
    }
    return string(hexString);
  }
}
