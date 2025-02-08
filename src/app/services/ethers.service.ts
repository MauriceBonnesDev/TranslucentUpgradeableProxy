import { Injectable, OnDestroy } from '@angular/core';
import {
  BrowserProvider,
  Signer,
  Contract,
  TransactionResponse,
  ethers,
} from 'ethers';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { ImplementationContractAddress } from '../components/home/home.component';
import { InterfaceAbi, toUtf8Bytes } from 'ethers';

@Injectable({
  providedIn: 'root',
})
export class EthersService implements OnDestroy {
  private provider: BrowserProvider | null = null;
  private signer: Signer | null = null;
  private proxyContract: Contract | null = null;
  private implementationContract: Contract | null = null;

  private proxyAddress = '0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9';

  private connectedWalletAddressSubject = new BehaviorSubject<string>('');
  public connectedWalletAddress$ =
    this.connectedWalletAddressSubject.asObservable();

  private addressChangeSubject = new Subject<string>();
  public addressChange$ = this.addressChangeSubject.asObservable();

  private eventListeners = new Map<string, boolean>();

  private totalValueChangeSubject = new Subject<number>();
  public totalValueChange$ = this.totalValueChangeSubject.asObservable();

  private addressChangeSubscription: Subscription;

  private domain = {
    name: 'TranslucentUpgradeableProxy',
    version: '1.0.0',
    chainId: 31337, // Sepolia ChainID: 11155111 Hardhat ChainID: 31337
    verifyingContract: this.proxyAddress,
  };

  private types = {
    Acknowledgment: [
      { name: 'user', type: 'address' },
      { name: 'newVersion', type: 'uint256' },
      { name: 'message', type: 'string' },
    ],
  };

  private abiProxy: InterfaceAbi = [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'initialImplementation',
          type: 'address',
        },
        {
          internalType: 'string',
          name: 'name',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'version',
          type: 'string',
        },
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      inputs: [],
      name: 'ECDSAInvalidSignature',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'length',
          type: 'uint256',
        },
      ],
      name: 'ECDSAInvalidSignatureLength',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: 's',
          type: 'bytes32',
        },
      ],
      name: 'ECDSAInvalidSignatureS',
      type: 'error',
    },
    {
      inputs: [],
      name: 'InvalidShortString',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'OwnableInvalidOwner',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'OwnableUnauthorizedAccount',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'string',
          name: 'str',
          type: 'string',
        },
      ],
      name: 'StringTooLong',
      type: 'error',
    },
    {
      anonymous: false,
      inputs: [],
      name: 'EIP712DomainChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferred',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'newImplementation',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newVersion',
          type: 'uint256',
        },
      ],
      name: 'Upgraded',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'user',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'version',
          type: 'uint256',
        },
      ],
      name: 'VersionAcknowledged',
      type: 'event',
    },
    {
      stateMutability: 'payable',
      type: 'fallback',
    },
    {
      inputs: [
        {
          internalType: 'bytes',
          name: 'signature',
          type: 'bytes',
        },
      ],
      name: 'acknowledgeVersion',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'implementation',
          type: 'address',
        },
      ],
      name: 'delegate',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'eip712Domain',
      outputs: [
        {
          internalType: 'bytes1',
          name: 'fields',
          type: 'bytes1',
        },
        {
          internalType: 'string',
          name: 'name',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'version',
          type: 'string',
        },
        {
          internalType: 'uint256',
          name: 'chainId',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'verifyingContract',
          type: 'address',
        },
        {
          internalType: 'bytes32',
          name: 'salt',
          type: 'bytes32',
        },
        {
          internalType: 'uint256[]',
          name: 'extensions',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getCurrentVersion',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'user',
          type: 'address',
        },
      ],
      name: 'getUserAcknowledgedVersion',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'version',
          type: 'uint256',
        },
      ],
      name: 'getVersionToImplementation',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'implementation',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'newImplementation',
          type: 'address',
        },
      ],
      name: 'upgradeTo',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      stateMutability: 'payable',
      type: 'receive',
    },
  ];

  private abiV1: InterfaceAbi = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'int256',
          name: 'newValue',
          type: 'int256',
        },
      ],
      name: 'TotalValueChanged',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'int256',
          name: '_num1',
          type: 'int256',
        },
        {
          internalType: 'int256',
          name: '_num2',
          type: 'int256',
        },
      ],
      name: 'sum',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalValue',
      outputs: [
        {
          internalType: 'int256',
          name: '',
          type: 'int256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  private abiV2: InterfaceAbi = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'int256',
          name: 'newValue',
          type: 'int256',
        },
      ],
      name: 'TotalValueChanged',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'int256',
          name: '_num1',
          type: 'int256',
        },
        {
          internalType: 'int256',
          name: '_num2',
          type: 'int256',
        },
      ],
      name: 'multiply',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'int256',
          name: '_num1',
          type: 'int256',
        },
        {
          internalType: 'int256',
          name: '_num2',
          type: 'int256',
        },
      ],
      name: 'sum',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalValue',
      outputs: [
        {
          internalType: 'int256',
          name: '',
          type: 'int256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  private abiV3: InterfaceAbi = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'int256',
          name: 'newValue',
          type: 'int256',
        },
      ],
      name: 'TotalValueChanged',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'bytes',
          name: 'signature',
          type: 'bytes',
        },
      ],
      name: 'acknowledgeVersion',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'int256',
          name: '_num1',
          type: 'int256',
        },
        {
          internalType: 'int256',
          name: '_num2',
          type: 'int256',
        },
      ],
      name: 'multiply',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'int256',
          name: '_num1',
          type: 'int256',
        },
        {
          internalType: 'int256',
          name: '_num2',
          type: 'int256',
        },
      ],
      name: 'subtract',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'int256',
          name: '_num1',
          type: 'int256',
        },
        {
          internalType: 'int256',
          name: '_num2',
          type: 'int256',
        },
      ],
      name: 'sum',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalValue',
      outputs: [
        {
          internalType: 'int256',
          name: '',
          type: 'int256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  private currentImplementationAbi: InterfaceAbi;

  constructor() {
    this.currentImplementationAbi = this.abiV1;

    this.addressChangeSubscription = this.addressChange$.subscribe(
      (address) => {
        switch (address) {
          case ImplementationContractAddress.ImplementationV1:
            this.currentImplementationAbi = this.abiV1;
            break;
          case ImplementationContractAddress.ImplementationV2:
            this.currentImplementationAbi = this.abiV2;
            break;
          case ImplementationContractAddress.ImplementationV3:
            this.currentImplementationAbi = this.abiV3;
            break;
          default:
            this.currentImplementationAbi = this.abiV1;
            break;
        }

        this.implementationContract = new Contract(
          this.proxyAddress,
          this.currentImplementationAbi,
          this.signer
        );
      }
    );
  }

  ngOnDestroy() {
    this.disconnectWallet();
    this.addressChangeSubscription.unsubscribe();
  }

  getProvider(): BrowserProvider | null {
    return this.provider;
  }

  async connectDisconnectWallet(): Promise<void> {
    if ((window as any).ethereum) {
      this.provider = new BrowserProvider((window as any).ethereum);
      await this.provider.send('eth_requestAccounts', []);
      this.signer = await this.provider.getSigner();
    }
    const currentAddress = await this.signer?.getAddress();

    if (this.connectedWalletAddressSubject.value === currentAddress) {
      await this.disconnectWallet();
    } else {
      await this.connectWallet();
    }
  }

  async connectWallet(): Promise<void> {
    if (this.signer) {
      this.proxyContract = new Contract(
        this.proxyAddress,
        this.abiProxy,
        this.signer
      );

      const address = await this.signer.getAddress();
      this.connectedWalletAddressSubject.next(address);

      const initialImplementationAddress = await this.proxyContract[
        'implementation'
      ]();
      this.addressChangeSubject.next(initialImplementationAddress);
      if (this.implementationContract) {
        this.totalValueChangeSubject.next(
          await this.implementationContract['totalValue']()
        );
      }

      if (!this.eventListeners.get('Upgraded')) {
        this.listenToUpgradeEvent();
        this.eventListeners.set('Upgraded', true);
      }

      if (!this.eventListeners.get('TotalValueChanged')) {
        this.listenToTotalValueChangedEvent();
        this.eventListeners.set('TotalValueChanged', true);
      }
    } else {
      alert('Metamask not found. Please install it.');
    }
  }

  async disconnectWallet(): Promise<void> {
    if (this.proxyContract) {
      this.proxyContract.removeAllListeners('Upgraded');
      this.eventListeners.delete('Upgraded');
    }

    if (this.implementationContract) {
      this.implementationContract.removeAllListeners('TotalValueChanged');
      this.eventListeners.delete('TotalValueChanged');
    }

    this.eventListeners.clear();

    this.connectedWalletAddressSubject.next('');
    this.signer = null;
    this.proxyContract = null;
    this.implementationContract = null;
  }

  private listenToUpgradeEvent(): void {
    if (!this.proxyContract) throw new Error('Proxy contract not initialized.');

    this.proxyContract.on(
      'Upgraded',
      (newAddress: string, newVersion: number) => {
        this.addressChangeSubject.next(newAddress);
      }
    );
  }

  private listenToTotalValueChangedEvent(): void {
    if (!this.implementationContract) {
      console.error('Implementation contract not initialized.');
      return;
    }

    this.implementationContract.on('TotalValueChanged', (newValue: number) => {
      this.totalValueChangeSubject.next(newValue);
    });
  }

  async callAcknowledgeVersion(): Promise<void> {
    if (!this.proxyContract || !this.signer || !this.implementationContract) {
      throw new Error(
        'Proxy contract, Implementation contract or signer not initialized.'
      );
    }

    try {
      const input = 'Test';
      const bytesInput = toUtf8Bytes(input);
      const tx = await this.implementationContract['acknowledgeVersion'](
        bytesInput
      );
      await tx.wait();
    } catch (error) {
      if (
        this.isErrorWithMessage(error) &&
        error.message.includes('ERROR_CODE_1')
      ) {
        await this.handleAcknowledgment();
        const input = 'Test';
        const bytesInput = toUtf8Bytes(input);
        const tx = await this.implementationContract['acknowledgeVersion'](
          bytesInput
        );
        await tx.wait();
      } else {
        console.error('Error during transaction:', error);
        throw error;
      }
    }
  }

  async callMethod(num1: number, num2: number, method: string): Promise<void> {
    if (!this.proxyContract || !this.signer || !this.implementationContract) {
      throw new Error(
        'Proxy contract, Implementation contract or signer not initialized.'
      );
    }

    try {
      const tx: TransactionResponse = await this.implementationContract[method](
        num1,
        num2
      );
      await tx.wait();
    } catch (error) {
      if (
        this.isErrorWithMessage(error) &&
        error.message.includes('ERROR_CODE_1')
      ) {
        await this.handleAcknowledgment();

        const tx: TransactionResponse = await this.implementationContract[
          method
        ](num1, num2);
        await tx.wait();
      } else {
        console.error('Error during transaction:', error);
        throw error;
      }
    }
  }

  private async handleAcknowledgment() {
    if (!this.proxyContract || !this.signer || !this.implementationContract) {
      throw new Error(
        'Proxy contract, Implementation contract or signer not initialized.'
      );
    }

    const userAddress = await this.signer!.getAddress();
    const userAcknowledgedVersion = await this.proxyContract[
      'getUserAcknowledgedVersion'
    ](userAddress);
    const acknowledgedAddress: string = (
      await this.proxyContract['getVersionToImplementation'](
        userAcknowledgedVersion
      )
    ).toLowerCase();
    const currentVersion = await this.proxyContract['getCurrentVersion']();
    const currentImplementationAddress: string = (
      await this.proxyContract['getVersionToImplementation'](currentVersion)
    ).toLowerCase();

    const message = {
      user: userAddress,
      newVersion: currentVersion,
      message: `You are currently on version ${userAcknowledgedVersion} (https://etherscan.io/address/${acknowledgedAddress}#code). The newest version is version ${currentVersion} (https://etherscan.io/address/${currentImplementationAddress}#code). Please sign this message to confirm the upgrade.`,
    };

    const signature = await this.signer.signTypedData(
      this.domain,
      this.types,
      message
    );

    const tx = await this.proxyContract['acknowledgeVersion'](signature);
    await tx.wait();
  }

  async upgradeContractVersion(
    newImplementationAddress: string
  ): Promise<void> {
    if (!this.proxyContract || !this.signer) {
      throw new Error('Proxy contract or signer not initialized.');
    }

    try {
      const tx: TransactionResponse = await this.proxyContract['upgradeTo'](
        newImplementationAddress
      );
      await tx.wait();
    } catch (error) {
      console.error('Error upgrading contract:', error);
      throw error;
    }
  }

  isErrorWithMessage(error: unknown): error is { message: string } {
    return typeof error === 'object' && error !== null && 'message' in error;
  }
}
