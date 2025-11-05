// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title VaultOfTime
 * @dev Enhanced time capsule with multi-sig unlock and token vesting
 */
contract ChronosVault is IERC721Receiver {

    // Capsule types
    enum CapsuleType { STANDARD, MULTISIG_WILL, VESTING }

    // Data structure for a time capsule
    struct Capsule {
        address payable owner;
        address payable recipient;
        bytes encryptedData;
        uint256 unlockTimestamp;
        uint256 ethValue;
        address nftContractAddress;
        uint256 nftTokenId;
        bool isUnsealed;
        CapsuleType capsuleType;
    }

    // Multi-signature will data
    struct MultiSigWill {
        address[] trustees;
        mapping(address => bool) hasApproved;
        uint256 requiredApprovals;
        uint256 currentApprovals;
        bool isExecuted;
    }

    // Token vesting data
    struct VestingSchedule {
        address tokenAddress;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256[] unlockTimestamps;
        uint256[] unlockAmounts;
    }

    // State variables
    mapping(uint256 => Capsule) public capsules;
    mapping(uint256 => MultiSigWill) public multiSigWills;
    mapping(uint256 => VestingSchedule) public vestingSchedules;
    uint256 public capsuleCount;

    // Events
    event CapsuleSealed(
        uint256 indexed capsuleId,
        address indexed owner,
        address indexed recipient,
        uint256 unlockTimestamp,
        CapsuleType capsuleType
    );

    event CapsuleUnsealed(
        uint256 indexed capsuleId,
        address recipient
    );

    event MultiSigApproval(
        uint256 indexed capsuleId,
        address indexed trustee,
        uint256 currentApprovals
    );

    event VestingReleased(
        uint256 indexed capsuleId,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @dev Seal a standard capsule with ETH
     */
    function sealCapsule(
        address payable _recipient,
        bytes memory _encryptedData,
        uint256 _unlockTimestamp
    ) public payable {
        require(_unlockTimestamp > block.timestamp, "Unlock time must be in the future");
        require(_recipient != address(0), "Invalid recipient address");

        capsules[capsuleCount] = Capsule({
            owner: payable(msg.sender),
            recipient: _recipient,
            encryptedData: _encryptedData,
            unlockTimestamp: _unlockTimestamp,
            ethValue: msg.value,
            nftContractAddress: address(0),
            nftTokenId: 0,
            isUnsealed: false,
            capsuleType: CapsuleType.STANDARD
        });

        emit CapsuleSealed(capsuleCount, msg.sender, _recipient, _unlockTimestamp, CapsuleType.STANDARD);
        capsuleCount++;
    }

    /**
     * @dev Seal a multi-signature will capsule
     */
    function sealMultiSigWill(
        address payable _recipient,
        bytes memory _encryptedData,
        uint256 _unlockTimestamp,
        address[] memory _trustees,
        uint256 _requiredApprovals
    ) public payable {
        require(_unlockTimestamp > block.timestamp, "Unlock time must be in the future");
        require(_recipient != address(0), "Invalid recipient address");
        require(_trustees.length >= _requiredApprovals, "Not enough trustees");
        require(_requiredApprovals > 0, "At least 1 approval required");

        capsules[capsuleCount] = Capsule({
            owner: payable(msg.sender),
            recipient: _recipient,
            encryptedData: _encryptedData,
            unlockTimestamp: _unlockTimestamp,
            ethValue: msg.value,
            nftContractAddress: address(0),
            nftTokenId: 0,
            isUnsealed: false,
            capsuleType: CapsuleType.MULTISIG_WILL
        });

        MultiSigWill storage will = multiSigWills[capsuleCount];
        will.trustees = _trustees;
        will.requiredApprovals = _requiredApprovals;
        will.currentApprovals = 0;
        will.isExecuted = false;

        emit CapsuleSealed(capsuleCount, msg.sender, _recipient, _unlockTimestamp, CapsuleType.MULTISIG_WILL);
        capsuleCount++;
    }

    /**
     * @dev Approve multi-sig will unlock (trustees only)
     */
    function approveMultiSigUnlock(uint256 _capsuleId) public {
        require(_capsuleId < capsuleCount, "Capsule does not exist");
        Capsule storage capsule = capsules[_capsuleId];
        require(capsule.capsuleType == CapsuleType.MULTISIG_WILL, "Not a multi-sig will");

        MultiSigWill storage will = multiSigWills[_capsuleId];
        require(!will.isExecuted, "Will already executed");
        require(isTrustee(_capsuleId, msg.sender), "Not a trustee");
        require(!will.hasApproved[msg.sender], "Already approved");

        will.hasApproved[msg.sender] = true;
        will.currentApprovals++;

        emit MultiSigApproval(_capsuleId, msg.sender, will.currentApprovals);
    }

    /**
     * @dev Check if address is a trustee
     */
    function isTrustee(uint256 _capsuleId, address _address) public view returns (bool) {
        MultiSigWill storage will = multiSigWills[_capsuleId];
        for (uint i = 0; i < will.trustees.length; i++) {
            if (will.trustees[i] == _address) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Seal a vesting schedule capsule for token distribution
     */
    function sealVestingSchedule(
        address payable _recipient,
        bytes memory _encryptedData,
        address _tokenAddress,
        uint256[] memory _unlockTimestamps,
        uint256[] memory _unlockAmounts
    ) public {
        require(_recipient != address(0), "Invalid recipient address");
        require(_tokenAddress != address(0), "Invalid token address");
        require(_unlockTimestamps.length == _unlockAmounts.length, "Timestamps and amounts must match");
        require(_unlockTimestamps.length > 0, "At least one unlock period required");

        uint256 totalAmount = 0;
        for (uint i = 0; i < _unlockAmounts.length; i++) {
            require(_unlockTimestamps[i] > block.timestamp, "All unlock times must be in future");
            if (i > 0) {
                require(_unlockTimestamps[i] > _unlockTimestamps[i-1], "Timestamps must be in order");
            }
            totalAmount += _unlockAmounts[i];
        }

        require(
            IERC20(_tokenAddress).transferFrom(msg.sender, address(this), totalAmount),
            "Token transfer failed"
        );

        capsules[capsuleCount] = Capsule({
            owner: payable(msg.sender),
            recipient: _recipient,
            encryptedData: _encryptedData,
            unlockTimestamp: _unlockTimestamps[0],
            ethValue: 0,
            nftContractAddress: address(0),
            nftTokenId: 0,
            isUnsealed: false,
            capsuleType: CapsuleType.VESTING
        });

        VestingSchedule storage vesting = vestingSchedules[capsuleCount];
        vesting.tokenAddress = _tokenAddress;
        vesting.totalAmount = totalAmount;
        vesting.releasedAmount = 0;
        vesting.unlockTimestamps = _unlockTimestamps;
        vesting.unlockAmounts = _unlockAmounts;

        emit CapsuleSealed(capsuleCount, msg.sender, _recipient, _unlockTimestamps[0], CapsuleType.VESTING);
        capsuleCount++;
    }

    /**
     * @dev Release vested tokens
     */
    function releaseVestedTokens(uint256 _capsuleId) public {
        require(_capsuleId < capsuleCount, "Capsule does not exist");
        Capsule storage capsule = capsules[_capsuleId];
        require(capsule.capsuleType == CapsuleType.VESTING, "Not a vesting capsule");
        require(msg.sender == capsule.recipient, "Only recipient can release");

        VestingSchedule storage vesting = vestingSchedules[_capsuleId];
        uint256 releasableAmount = 0;

        for (uint i = 0; i < vesting.unlockTimestamps.length; i++) {
            if (block.timestamp >= vesting.unlockTimestamps[i]) {
                releasableAmount += vesting.unlockAmounts[i];
            } else {
                break;
            }
        }

        uint256 amountToRelease = releasableAmount - vesting.releasedAmount;
        require(amountToRelease > 0, "No tokens to release");

        vesting.releasedAmount = releasableAmount;

        require(
            IERC20(vesting.tokenAddress).transfer(capsule.recipient, amountToRelease),
            "Token transfer failed"
        );

        emit VestingReleased(_capsuleId, amountToRelease, block.timestamp);

        if (vesting.releasedAmount == vesting.totalAmount) {
            capsule.isUnsealed = true;
        }
    }

    /**
     * @dev Seal a capsule with an NFT
     */
    function sealCapsuleWithNFT(
        address payable _recipient,
        bytes memory _encryptedData,
        uint256 _unlockTimestamp,
        address _nftContractAddress,
        uint256 _nftTokenId
    ) public {
        require(_unlockTimestamp > block.timestamp, "Unlock time must be in the future");
        require(_recipient != address(0), "Invalid recipient address");
        require(_nftContractAddress != address(0), "Invalid NFT contract address");

        IERC721(_nftContractAddress).transferFrom(msg.sender, address(this), _nftTokenId);

        capsules[capsuleCount] = Capsule({
            owner: payable(msg.sender),
            recipient: _recipient,
            encryptedData: _encryptedData,
            unlockTimestamp: _unlockTimestamp,
            ethValue: 0,
            nftContractAddress: _nftContractAddress,
            nftTokenId: _nftTokenId,
            isUnsealed: false,
            capsuleType: CapsuleType.STANDARD
        });

        emit CapsuleSealed(capsuleCount, msg.sender, _recipient, _unlockTimestamp, CapsuleType.STANDARD);
        capsuleCount++;
    }

    /**
     * @dev Unseal a capsule
     */
    function unsealCapsule(uint256 _capsuleId) public {
        require(_capsuleId < capsuleCount, "Capsule does not exist");
        Capsule storage capsule = capsules[_capsuleId];
        require(!capsule.isUnsealed, "Capsule already unsealed");

        if (capsule.capsuleType == CapsuleType.STANDARD) {
            require(block.timestamp >= capsule.unlockTimestamp, "Capsule is still locked");
        } else if (capsule.capsuleType == CapsuleType.MULTISIG_WILL) {
            MultiSigWill storage will = multiSigWills[_capsuleId];
            require(
                block.timestamp >= capsule.unlockTimestamp ||
                will.currentApprovals >= will.requiredApprovals,
                "Not enough approvals or time not reached"
            );
            will.isExecuted = true;
        }

        capsule.isUnsealed = true;

        if (capsule.ethValue > 0) {
            capsule.recipient.transfer(capsule.ethValue);
        }

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
     * @dev Get vesting schedule details
     */
    function getVestingDetails(uint256 _capsuleId) public view returns (
        address tokenAddress,
        uint256 totalAmount,
        uint256 releasedAmount,
        uint256[] memory unlockTimestamps,
        uint256[] memory unlockAmounts
    ) {
        require(_capsuleId < capsuleCount, "Capsule does not exist");
        require(capsules[_capsuleId].capsuleType == CapsuleType.VESTING, "Not a vesting capsule");

        VestingSchedule storage vesting = vestingSchedules[_capsuleId];
        return (
            vesting.tokenAddress,
            vesting.totalAmount,
            vesting.releasedAmount,
            vesting.unlockTimestamps,
            vesting.unlockAmounts
        );
    }

    /**
     * @dev Get multi-sig will details
     */
    function getMultiSigDetails(uint256 _capsuleId) public view returns (
        address[] memory trustees,
        uint256 requiredApprovals,
        uint256 currentApprovals,
        bool isExecuted
    ) {
        require(_capsuleId < capsuleCount, "Capsule does not exist");
        require(capsules[_capsuleId].capsuleType == CapsuleType.MULTISIG_WILL, "Not a multi-sig will");

        MultiSigWill storage will = multiSigWills[_capsuleId];
        return (
            will.trustees,
            will.requiredApprovals,
            will.currentApprovals,
            will.isExecuted
        );
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
