// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title ChronosVault
 * @dev A decentralized time capsule system for locking ETH, NFTs, and encrypted data
 */
contract ChronosVault is IERC721Receiver {

    // Data structure for a time capsule
    struct Capsule {
        address payable owner;
        address payable recipient;
        bytes encryptedData;
        string decryptionKey;
        uint256 unlockTimestamp;
        uint256 ethValue;
        address nftContractAddress;
        uint256 nftTokenId;
        bool isUnsealed;
    }

    // State variables
    mapping(uint256 => Capsule) public capsules;
    uint256 public capsuleCount;

    // Events
    event CapsuleSealed(
        uint256 indexed capsuleId,
        address indexed owner,
        address indexed recipient,
        uint256 unlockTimestamp
    );

    event CapsuleUnsealed(
        uint256 indexed capsuleId,
        address recipient
    );

    /**
     * @dev Seal a capsule with ETH
     * @param _recipient Address that can unseal the capsule
     * @param _encryptedData Encrypted message or data
     * @param _decryptionKey Key to decrypt the data (stored on-chain but only accessible after unsealing)
     * @param _unlockTimestamp UNIX timestamp when the capsule can be unsealed
     */
    function sealCapsule(
        address payable _recipient,
        bytes memory _encryptedData,
        string memory _decryptionKey,
        uint256 _unlockTimestamp
    ) public payable {
        require(_unlockTimestamp > block.timestamp, "Unlock time must be in the future");
        require(_recipient != address(0), "Invalid recipient address");

        capsules[capsuleCount] = Capsule({
            owner: payable(msg.sender),
            recipient: _recipient,
            encryptedData: _encryptedData,
            decryptionKey: _decryptionKey,
            unlockTimestamp: _unlockTimestamp,
            ethValue: msg.value,
            nftContractAddress: address(0),
            nftTokenId: 0,
            isUnsealed: false
        });

        emit CapsuleSealed(capsuleCount, msg.sender, _recipient, _unlockTimestamp);
        capsuleCount++;
    }

    /**
     * @dev Seal a capsule with an NFT
     * @param _recipient Address that can unseal the capsule
     * @param _encryptedData Encrypted message or data
     * @param _decryptionKey Key to decrypt the data
     * @param _unlockTimestamp UNIX timestamp when the capsule can be unsealed
     * @param _nftContractAddress Contract address of the NFT to lock
     * @param _nftTokenId Token ID of the NFT to lock
     */
    function sealCapsuleWithNFT(
        address payable _recipient,
        bytes memory _encryptedData,
        string memory _decryptionKey,
        uint256 _unlockTimestamp,
        address _nftContractAddress,
        uint256 _nftTokenId
    ) public {
        require(_unlockTimestamp > block.timestamp, "Unlock time must be in the future");
        require(_recipient != address(0), "Invalid recipient address");
        require(_nftContractAddress != address(0), "Invalid NFT contract address");

        // Transfer NFT from user to this contract
        // User must have approved this contract beforehand
        IERC721(_nftContractAddress).transferFrom(msg.sender, address(this), _nftTokenId);

        capsules[capsuleCount] = Capsule({
            owner: payable(msg.sender),
            recipient: _recipient,
            encryptedData: _encryptedData,
            decryptionKey: _decryptionKey,
            unlockTimestamp: _unlockTimestamp,
            ethValue: 0,
            nftContractAddress: _nftContractAddress,
            nftTokenId: _nftTokenId,
            isUnsealed: false
        });

        emit CapsuleSealed(capsuleCount, msg.sender, _recipient, _unlockTimestamp);
        capsuleCount++;
    }

    /**
     * @dev Unseal a capsule and release its contents
     * @param _capsuleId ID of the capsule to unseal
     */
    function unsealCapsule(uint256 _capsuleId) public {
        require(_capsuleId < capsuleCount, "Capsule does not exist");

        Capsule storage capsule = capsules[_capsuleId];

        require(block.timestamp >= capsule.unlockTimestamp, "Capsule is still locked");
        require(!capsule.isUnsealed, "Capsule already unsealed");

        // Mark as unsealed
        capsule.isUnsealed = true;

        // Transfer ETH if any
        if (capsule.ethValue > 0) {
            capsule.recipient.transfer(capsule.ethValue);
        }

        // Transfer NFT if any
        if (capsule.nftContractAddress != address(0)) {
            IERC721(capsule.nftContractAddress).safeTransferFrom(
                address(this),
                capsule.recipient,
                capsule.nftTokenId
            );
        }

        emit CapsuleUnsealed(_capsuleId, capsule.recipient);
    }

    /**
     * @dev Get the decryption key for an unsealed capsule
     * @param _capsuleId ID of the capsule
     * @return The decryption key
     */
    function getDecryptionKey(uint256 _capsuleId) public view returns (string memory) {
        require(_capsuleId < capsuleCount, "Capsule does not exist");
        require(capsules[_capsuleId].isUnsealed, "Capsule must be unsealed first");

        return capsules[_capsuleId].decryptionKey;
    }

    /**
     * @dev Required for receiving ERC721 tokens
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
