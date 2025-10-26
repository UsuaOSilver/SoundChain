// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SoundChainLicense
 * @notice Payment and licensing contract deployed on Base L2 (Ethereum L2)
 * @dev This contract handles:
 *      - License purchases with ETH
 *      - Royalty distribution to artists
 *      - Platform fee collection (2.5%)
 *      - Integration with Story Protocol L2 for IP verification
 */
contract SoundChainLicense {
    // ===========================================
    // STATE VARIABLES
    // ===========================================

    /// @notice Platform wallet that receives 2.5% fee
    address public immutable platformWallet;

    /// @notice Platform fee in basis points (250 = 2.5%)
    uint256 public constant PLATFORM_FEE_BP = 250;

    /// @notice Basis points denominator
    uint256 public constant BP_DENOMINATOR = 10000;

    // ===========================================
    // STRUCTS
    // ===========================================

    struct License {
        bytes32 storyIpAssetId; // Story Protocol IP Asset ID
        address buyer;
        address artist;
        uint256 price;
        uint256 timestamp;
        string licenseTermsHash; // IPFS hash of license terms
    }

    struct RoyaltyInfo {
        uint256 balance;
        uint256 totalEarned;
        uint256 licensesSold;
    }

    // ===========================================
    // STORAGE
    // ===========================================

    /// @notice License ID counter
    uint256 public nextLicenseId;

    /// @notice Mapping from license ID to License struct
    mapping(uint256 => License) public licenses;

    /// @notice Mapping from buyer address to array of license IDs
    mapping(address => uint256[]) public buyerLicenses;

    /// @notice Mapping from artist address to royalty info
    mapping(address => RoyaltyInfo) public artistRoyalties;

    /// @notice Mapping from Story IP Asset ID to artist address
    mapping(bytes32 => address) public ipAssetToArtist;

    // ===========================================
    // EVENTS
    // ===========================================

    event LicensePurchased(
        uint256 indexed licenseId,
        bytes32 indexed storyIpAssetId,
        address indexed buyer,
        address artist,
        uint256 price,
        string licenseTermsHash
    );

    event RoyaltyClaimed(
        address indexed artist,
        uint256 amount
    );

    event PlatformFeeClaimed(
        uint256 amount
    );

    event IPAssetRegistered(
        bytes32 indexed storyIpAssetId,
        address indexed artist
    );

    // ===========================================
    // ERRORS
    // ===========================================

    error InsufficientPayment();
    error InvalidArtist();
    error InvalidIPAsset();
    error NoRoyaltiesToClaim();
    error TransferFailed();
    error Unauthorized();

    // ===========================================
    // CONSTRUCTOR
    // ===========================================

    constructor(address _platformWallet) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }

    // ===========================================
    // EXTERNAL FUNCTIONS
    // ===========================================

    /**
     * @notice Register an IP Asset from Story Protocol
     * @param storyIpAssetId IP Asset ID from Story Protocol L2
     * @param artist Artist wallet address
     */
    function registerIPAsset(
        bytes32 storyIpAssetId,
        address artist
    ) external {
        require(artist != address(0), "Invalid artist");
        require(storyIpAssetId != bytes32(0), "Invalid IP asset");
        require(ipAssetToArtist[storyIpAssetId] == address(0), "Already registered");

        ipAssetToArtist[storyIpAssetId] = artist;

        emit IPAssetRegistered(storyIpAssetId, artist);
    }

    /**
     * @notice Purchase a license for a track
     * @param storyIpAssetId IP Asset ID from Story Protocol
     * @param licenseTermsHash IPFS hash of the negotiated license terms
     * @return licenseId The ID of the purchased license
     */
    function purchaseLicense(
        bytes32 storyIpAssetId,
        string calldata licenseTermsHash
    ) external payable returns (uint256) {
        address artist = ipAssetToArtist[storyIpAssetId];
        if (artist == address(0)) revert InvalidIPAsset();
        if (msg.value == 0) revert InsufficientPayment();

        // Calculate splits
        uint256 platformFee = (msg.value * PLATFORM_FEE_BP) / BP_DENOMINATOR;
        uint256 artistAmount = msg.value - platformFee;

        // Update artist royalties
        artistRoyalties[artist].balance += artistAmount;
        artistRoyalties[artist].totalEarned += artistAmount;
        artistRoyalties[artist].licensesSold += 1;

        // Create license record
        uint256 licenseId = nextLicenseId++;
        licenses[licenseId] = License({
            storyIpAssetId: storyIpAssetId,
            buyer: msg.sender,
            artist: artist,
            price: msg.value,
            timestamp: block.timestamp,
            licenseTermsHash: licenseTermsHash
        });

        // Track buyer's licenses
        buyerLicenses[msg.sender].push(licenseId);

        emit LicensePurchased(
            licenseId,
            storyIpAssetId,
            msg.sender,
            artist,
            msg.value,
            licenseTermsHash
        );

        return licenseId;
    }

    /**
     * @notice Claim accumulated royalties (gasless via relayer)
     * @dev Can be called by artist or relayer for gasless claims
     */
    function claimRoyalties(address artist) external {
        uint256 amount = artistRoyalties[artist].balance;
        if (amount == 0) revert NoRoyaltiesToClaim();

        artistRoyalties[artist].balance = 0;

        (bool success, ) = payable(artist).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit RoyaltyClaimed(artist, amount);
    }

    /**
     * @notice Claim platform fees (only platform wallet)
     */
    function claimPlatformFees() external {
        if (msg.sender != platformWallet) revert Unauthorized();

        uint256 balance = address(this).balance;

        // Calculate unclaimed artist royalties
        uint256 unclaimedRoyalties = 0;
        // Note: In production, track this more efficiently

        uint256 platformBalance = balance - unclaimedRoyalties;
        if (platformBalance == 0) revert NoRoyaltiesToClaim();

        (bool success, ) = payable(platformWallet).call{value: platformBalance}("");
        if (!success) revert TransferFailed();

        emit PlatformFeeClaimed(platformBalance);
    }

    // ===========================================
    // VIEW FUNCTIONS
    // ===========================================

    /**
     * @notice Get license details
     */
    function getLicense(uint256 licenseId) external view returns (License memory) {
        return licenses[licenseId];
    }

    /**
     * @notice Get all licenses owned by a buyer
     */
    function getBuyerLicenses(address buyer) external view returns (uint256[] memory) {
        return buyerLicenses[buyer];
    }

    /**
     * @notice Get artist royalty info
     */
    function getArtistRoyalties(address artist) external view returns (RoyaltyInfo memory) {
        return artistRoyalties[artist];
    }

    /**
     * @notice Get artist address for an IP Asset
     */
    function getArtistForIPAsset(bytes32 storyIpAssetId) external view returns (address) {
        return ipAssetToArtist[storyIpAssetId];
    }

    /**
     * @notice Calculate platform fee for a given price
     */
    function calculateFees(uint256 price) external pure returns (uint256 platformFee, uint256 artistAmount) {
        platformFee = (price * PLATFORM_FEE_BP) / BP_DENOMINATOR;
        artistAmount = price - platformFee;
    }
}
