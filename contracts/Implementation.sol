// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ImplementationStorage {
  bytes32 internal constant TOTAL_VALUE_SLOT =
    keccak256("implementation.total.value");

  function _getTotalValue() internal view returns (int256) {
    return _loadInt256(TOTAL_VALUE_SLOT);
  }

  function _setTotalValue(int256 value) internal {
    _storeInt256(TOTAL_VALUE_SLOT, value);
  }

  function _loadInt256(bytes32 slot) internal view returns (int256 value) {
    assembly {
      value := sload(slot)
    }
  }

  function _storeInt256(bytes32 slot, int256 value) internal {
    assembly {
      sstore(slot, value)
    }
  }
}

contract ImplementationV1 is ImplementationStorage {
  event TotalValueChanged(int256 newValue);

  function sum(int256 _num1, int256 _num2) public {
    _setTotalValue(_num1 + _num2);
    emit TotalValueChanged(_getTotalValue());
  }

  function totalValue() public view returns (int256) {
    return _getTotalValue();
  }
}

contract ImplementationV2 is ImplementationStorage {
  event TotalValueChanged(int256 newValue);

  function sum(int256 _num1, int256 _num2) public {
    _setTotalValue(_num1 + _num2);
    emit TotalValueChanged(_getTotalValue());
  }

  function multiply(int256 _num1, int256 _num2) public {
    _setTotalValue(_num1 * _num2);
    emit TotalValueChanged(_getTotalValue());
  }

  function totalValue() public view returns (int256) {
    return _getTotalValue();
  }
}

contract ImplementationV3 is ImplementationStorage {
  event TotalValueChanged(int256 newValue);

  function sum(int256 _num1, int256 _num2) public {
    _setTotalValue(_num1 + _num2);
    emit TotalValueChanged(_getTotalValue());
  }

  function subtract(int256 _num1, int256 _num2) public {
    _setTotalValue(_num1 - _num2);
    emit TotalValueChanged(_getTotalValue());
  }

  function multiply(int256 _num1, int256 _num2) public {
    _setTotalValue(_num1 * _num2);
    emit TotalValueChanged(_getTotalValue());
  }

  function acknowledgeVersion(bytes memory signature) public {
    _setTotalValue(9999999);
    emit TotalValueChanged(_getTotalValue());
  }

  function totalValue() public view returns (int256) {
    return _getTotalValue();
  }
}
