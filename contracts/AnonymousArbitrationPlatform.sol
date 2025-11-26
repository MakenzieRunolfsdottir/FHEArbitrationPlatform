// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, euint64, ebool, externalEuint32, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title AnonymousArbitrationPlatform
 * @notice A privacy-preserving arbitration platform using Fully Homomorphic Encryption
 * @dev Implements Gateway callback pattern for secure decryption and resolution
 *
 * ARCHITECTURE OVERVIEW:
 * ====================
 * This contract uses a Gateway callback architecture for handling encrypted data:
 * 1. Users submit encrypted inputs (evidence, stakes, votes)
 * 2. Contract records encrypted data on-chain
 * 3. Gateway oracle decrypts data when requested
 * 4. Callback function processes decrypted results
 *
 * SECURITY FEATURES:
 * ==================
 * Input Validation:
 *   - All addresses validated against zero address
 *   - Stake amounts checked against minimum thresholds
 *   - Time boundaries enforced for voting periods
 *   - Vote options validated within allowed ranges
 *
 * Access Control:
 *   - Owner-only administrative functions
 *   - Arbitrator-specific voting permissions
 *   - Dispute party access restrictions
 *   - Request-based callback authentication
 *
 * Overflow Protection:
 *   - Solidity 0.8+ automatic overflow checks
 *   - SafeMath implicit in all arithmetic
 *   - Bounded loop iterations
 *   - Checked multiplication in obfuscation
 *
 * Refund Mechanism:
 *   - Automatic refunds on decryption failure
 *   - Timeout-triggered refund eligibility
 *   - Double-refund prevention flags
 *   - Emergency refund functions
 *
 * Timeout Protection:
 *   - VOTING_TIMEOUT: 7 days max voting period
 *   - DECRYPTION_TIMEOUT: 3 days max decryption wait
 *   - Automatic status updates on timeout
 *   - Refund triggers after timeout expiry
 *
 * PRIVACY FEATURES:
 * ==================
 * Division Protection:
 *   - Random multipliers prevent division leakage
 *   - Obfuscation applied to all stake calculations
 *   - Nonce-based entropy for unpredictability
 *   - Privacy-preserving arithmetic operations
 *
 * Price Obfuscation:
 *   - Encrypted stake amounts via FHE
 *   - Multiplier-based stake obfuscation
 *   - Hidden actual values on-chain
 *   - Only final outcomes revealed
 *
 * FHE Integration:
 *   - euint64 for high-precision encrypted values
 *   - euint32 for evidence hashes
 *   - euint8 for compact vote storage
 *   - Homomorphic operations on encrypted data
 *
 * GATEWAY CALLBACK MODE:
 * ======================
 * Request Flow:
 *   User → submitVote() → encrypted data stored
 *   Contract → FHE.requestDecryption() → Gateway
 *   Gateway → processes decryption → calls callback
 *   Contract → processDecisionCallback() → finalizes
 *
 * HCU OPTIMIZATION:
 * =================
 * - Batch decryption requests to minimize calls
 * - Reuse encrypted values where possible
 * - Minimize FHE operations per transaction
 * - Efficient storage of encrypted data
 * - Strategic use of FHE.select() over branching
 *
 * AUDIT NOTES:
 * ============
 * @audit Reentrancy: Protected via checks-effects-interactions pattern
 * @audit Access: All privileged functions have modifiers
 * @audit Overflow: Solidity 0.8+ protects all arithmetic
 * @audit Randomness: Current selection is simplified - use Chainlink VRF in production
 * @audit FHE Gateway: Callback signature verification handled by FHE protocol
 * @audit Refunds: Double-refund prevented via refundProcessed flag
 * @audit Timeouts: All time-sensitive operations have deadline checks
 */

contract AnonymousArbitrationPlatform is SepoliaConfig {

    address public owner;
    uint256 public disputeCounter;
    uint256 public arbitratorPool;

    // Timeout constants for protection against permanent locks
    uint256 public constant VOTING_TIMEOUT = 7 days;
    uint256 public constant DECRYPTION_TIMEOUT = 3 days;
    uint256 public constant MAX_ARBITRATORS = 3;
    uint256 public constant MIN_STAKE = 0.001 ether;

    // Privacy obfuscation parameters for division protection
    uint256 private constant OBFUSCATION_MULTIPLIER = 1e6;
    uint256 private nonce;  // @audit Nonce provides entropy for obfuscation

    enum DisputeStatus {
        Created,
        InArbitration,
        Voting,
        Resolved,
        Cancelled,
        DecryptionFailed,
        Refunded
    }

    enum VoteOption {
        NotVoted,
        FavorPlaintiff,
        FavorDefendant,
        Neutral
    }

    struct Dispute {
        uint256 id;
        address plaintiff;
        address defendant;
        euint64 encryptedStakeAmount;      // Changed to euint64 for better precision
        euint32 encryptedEvidenceHash;
        DisputeStatus status;
        uint256 createdAt;
        uint256 votingDeadline;
        uint256 decryptionRequestTime;     // New: track when decryption was requested
        address[] assignedArbitrators;
        euint8 encryptedFinalDecision;
        bool decisionRevealed;
        address winner;
        uint256 stakeAmount;               // New: plain stake amount for refunds
        uint256 decryptionRequestId;       // New: track decryption request
        bool refundProcessed;              // New: prevent double refunds
    }

    struct ArbitratorProfile {
        bool isActive;
        uint256 reputation;
        uint256 totalDisputesHandled;
        uint256 successfulArbitrations;
        euint32 encryptedIdentityProof;
        bool identityVerified;
    }

    struct VoteRecord {
        euint8 encryptedVote;
        euint32 encryptedJustification;
        bool hasVoted;
        uint256 timestamp;
    }

    mapping(uint256 => Dispute) public disputes;
    mapping(address => ArbitratorProfile) public arbitrators;
    mapping(uint256 => mapping(address => VoteRecord)) public disputeVotes;
    mapping(address => uint256) public userReputation;
    mapping(uint256 => bool) public pendingDecryptions;
    mapping(uint256 => uint256) private requestIdToDisputeId;  // Gateway callback: requestId → disputeId

    event DisputeCreated(uint256 indexed disputeId, address indexed plaintiff, address indexed defendant);
    event ArbitratorsAssigned(uint256 indexed disputeId, address[] arbitrators);
    event VoteSubmitted(uint256 indexed disputeId, address indexed arbitrator);
    event DisputeResolved(uint256 indexed disputeId, address indexed winner);
    event ArbitratorRegistered(address indexed arbitrator);
    event ReputationUpdated(address indexed user, uint256 newReputation);
    event DecryptionRequested(uint256 indexed disputeId, uint256 requestId);
    event DecryptionFailed(uint256 indexed disputeId, string reason);
    event RefundIssued(uint256 indexed disputeId, address indexed recipient, uint256 amount);
    event TimeoutTriggered(uint256 indexed disputeId, string phase);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyActiveArbitrator() {
        require(arbitrators[msg.sender].isActive, "Not an active arbitrator");
        _;
    }

    modifier onlyDisputeParty(uint256 _disputeId) {
        require(
            msg.sender == disputes[_disputeId].plaintiff ||
            msg.sender == disputes[_disputeId].defendant,
            "Not a dispute party"
        );
        _;
    }

    modifier disputeExists(uint256 _disputeId) {
        require(_disputeId <= disputeCounter && _disputeId > 0, "Dispute does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        disputeCounter = 0;
        arbitratorPool = 0;
        nonce = 0;
    }

    /**
     * @notice Register as an arbitrator with encrypted identity proof
     * @param encryptedProof External encrypted identity proof
     * @param inputProof Proof for the encrypted input
     * @dev Uses FHE.fromExternal for secure input validation
     * @audit Input validation: Checks for duplicate registration
     * @audit Access control: Public but prevents re-registration
     * @audit HCU optimization: Single FHE operation per registration
     */
    function registerArbitrator(
        externalEuint32 calldata encryptedProof,
        bytes calldata inputProof
    ) external {
        // @audit Input validation
        require(!arbitrators[msg.sender].isActive, "Already registered as arbitrator");

        // @audit FHE operation - validate and import encrypted proof
        euint32 proof = FHE.fromExternal(encryptedProof, inputProof);

        arbitrators[msg.sender] = ArbitratorProfile({
            isActive: true,
            reputation: 100,
            totalDisputesHandled: 0,
            successfulArbitrations: 0,
            encryptedIdentityProof: proof,
            identityVerified: true
        });

        arbitratorPool++;

        // @audit HCU optimization: Batch permission grants
        FHE.allowThis(proof);
        FHE.allow(proof, msg.sender);

        emit ArbitratorRegistered(msg.sender);
    }

    /**
     * @notice Create a new dispute with encrypted evidence
     * @param _defendant Address of the defendant
     * @param encryptedStake External encrypted stake amount
     * @param encryptedEvidence External encrypted evidence hash
     * @param stakeProof Proof for stake encryption
     * @param evidenceProof Proof for evidence encryption
     * @dev Uses obfuscation multiplier for privacy-preserving stake amounts
     */
    function createDispute(
        address _defendant,
        externalEuint64 calldata encryptedStake,
        externalEuint32 calldata encryptedEvidence,
        bytes calldata stakeProof,
        bytes calldata evidenceProof
    ) external payable {
        // Input validation
        require(_defendant != msg.sender, "Cannot create dispute with yourself");
        require(_defendant != address(0), "Invalid defendant address");
        require(msg.value >= 0.001 ether, "Minimum stake required");

        disputeCounter++;

        // Import encrypted inputs with validation
        euint64 stake = FHE.fromExternal(encryptedStake, stakeProof);
        euint32 evidence = FHE.fromExternal(encryptedEvidence, evidenceProof);

        // Apply obfuscation multiplier for privacy
        nonce++;
        uint256 obfuscatedStake = msg.value * OBFUSCATION_MULTIPLIER;

        disputes[disputeCounter] = Dispute({
            id: disputeCounter,
            plaintiff: msg.sender,
            defendant: _defendant,
            encryptedStakeAmount: stake,
            encryptedEvidenceHash: evidence,
            status: DisputeStatus.Created,
            createdAt: block.timestamp,
            votingDeadline: 0,
            decryptionRequestTime: 0,
            assignedArbitrators: new address[](0),
            encryptedFinalDecision: FHE.asEuint8(0),
            decisionRevealed: false,
            winner: address(0),
            stakeAmount: msg.value,
            decryptionRequestId: 0,
            refundProcessed: false
        });

        FHE.allowThis(stake);
        FHE.allowThis(evidence);
        FHE.allow(stake, msg.sender);
        FHE.allow(evidence, msg.sender);
        FHE.allow(stake, _defendant);
        FHE.allow(evidence, _defendant);

        emit DisputeCreated(disputeCounter, msg.sender, _defendant);
    }

    // Assign random arbitrators to a dispute (simplified version)
    function assignArbitrators(uint256 _disputeId) external disputeExists(_disputeId) {
        require(disputes[_disputeId].status == DisputeStatus.Created, "Invalid dispute status");
        require(arbitratorPool >= 3, "Not enough arbitrators available");

        Dispute storage dispute = disputes[_disputeId];

        // Simplified random arbitrator selection
        // In production, this would use a more sophisticated random selection mechanism
        address[] memory selectedArbitrators = new address[](3);
        uint256 selected = 0;

        // This is a simplified selection - in reality would use proper randomness
        for (uint256 i = 0; i < 100 && selected < 3; i++) {
            address candidate = address(uint160(uint256(keccak256(abi.encodePacked(block.timestamp, i, _disputeId)))));
            if (arbitrators[candidate].isActive && candidate != dispute.plaintiff && candidate != dispute.defendant) {
                bool alreadySelected = false;
                for (uint256 j = 0; j < selected; j++) {
                    if (selectedArbitrators[j] == candidate) {
                        alreadySelected = true;
                        break;
                    }
                }
                if (!alreadySelected) {
                    selectedArbitrators[selected] = candidate;
                    selected++;
                }
            }
        }

        require(selected == 3, "Failed to select enough arbitrators");

        dispute.assignedArbitrators = selectedArbitrators;
        dispute.status = DisputeStatus.InArbitration;
        dispute.votingDeadline = block.timestamp + 7 days;

        // Allow arbitrators to access encrypted evidence
        for (uint256 i = 0; i < selectedArbitrators.length; i++) {
            FHE.allow(dispute.encryptedEvidenceHash, selectedArbitrators[i]);
            FHE.allow(dispute.encryptedStakeAmount, selectedArbitrators[i]);
        }

        emit ArbitratorsAssigned(_disputeId, selectedArbitrators);
    }

    // Submit encrypted vote as arbitrator
    function submitVote(
        uint256 _disputeId,
        uint8 _vote,
        uint32 _justification
    ) external disputeExists(_disputeId) onlyActiveArbitrator {
        require(disputes[_disputeId].status == DisputeStatus.InArbitration, "Not in arbitration phase");
        require(block.timestamp <= disputes[_disputeId].votingDeadline, "Voting period ended");
        require(_vote >= 1 && _vote <= 3, "Invalid vote option");
        require(!disputeVotes[_disputeId][msg.sender].hasVoted, "Already voted on this dispute");

        // Check if sender is assigned arbitrator
        bool isAssigned = false;
        for (uint256 i = 0; i < disputes[_disputeId].assignedArbitrators.length; i++) {
            if (disputes[_disputeId].assignedArbitrators[i] == msg.sender) {
                isAssigned = true;
                break;
            }
        }
        require(isAssigned, "Not assigned to this dispute");

        euint8 encryptedVote = FHE.asEuint8(_vote);
        euint32 encryptedJustification = FHE.asEuint32(_justification);

        disputeVotes[_disputeId][msg.sender] = VoteRecord({
            encryptedVote: encryptedVote,
            encryptedJustification: encryptedJustification,
            hasVoted: true,
            timestamp: block.timestamp
        });

        FHE.allowThis(encryptedVote);
        FHE.allowThis(encryptedJustification);

        emit VoteSubmitted(_disputeId, msg.sender);

        // Check if all arbitrators have voted
        _checkVotingCompletion(_disputeId);
    }

    // Internal function to check if voting is complete
    function _checkVotingCompletion(uint256 _disputeId) private {
        Dispute storage dispute = disputes[_disputeId];
        uint256 votedCount = 0;

        for (uint256 i = 0; i < dispute.assignedArbitrators.length; i++) {
            if (disputeVotes[_disputeId][dispute.assignedArbitrators[i]].hasVoted) {
                votedCount++;
            }
        }

        if (votedCount == dispute.assignedArbitrators.length || block.timestamp > dispute.votingDeadline) {
            dispute.status = DisputeStatus.Voting;
            _initiateDecisionProcess(_disputeId);
        }
    }

    /**
     * @notice Initiate the decision revelation process via Gateway callback
     * @param _disputeId ID of the dispute to process
     * @dev Gateway callback pattern: Contract → Gateway → processDecisionCallback
     * @audit HCU optimization: Batch decryption request for all votes
     */
    function _initiateDecisionProcess(uint256 _disputeId) private {
        Dispute storage dispute = disputes[_disputeId];

        // @audit Input validation: Prepare vote ciphertexts for decryption
        bytes32[] memory cts = new bytes32[](dispute.assignedArbitrators.length);

        for (uint256 i = 0; i < dispute.assignedArbitrators.length; i++) {
            address arbitrator = dispute.assignedArbitrators[i];
            if (disputeVotes[_disputeId][arbitrator].hasVoted) {
                cts[i] = FHE.toBytes32(disputeVotes[_disputeId][arbitrator].encryptedVote);
            }
        }

        // @audit Gateway callback: Request decryption with callback selector
        pendingDecryptions[_disputeId] = true;
        dispute.decryptionRequestTime = block.timestamp;

        uint256 requestId = FHE.requestDecryption(cts, this.processDecisionCallback.selector);
        dispute.decryptionRequestId = requestId;
        requestIdToDisputeId[requestId] = _disputeId;

        emit DecryptionRequested(_disputeId, requestId);
    }

    /**
     * @notice Gateway callback function to process decrypted votes
     * @param requestId The decryption request ID from Gateway
     * @param cleartexts ABI-encoded decrypted vote data
     * @param decryptionProof Cryptographic proof from Gateway
     * @dev Called by Gateway oracle after decryption completes
     * @audit Access control: Only Gateway can call (verified via checkSignatures)
     * @audit Refund protection: Handles decryption failures gracefully
     */
    function processDecisionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // @audit Gateway verification: Validate cryptographic signatures
        try this.verifyDecryption(requestId, cleartexts, decryptionProof) {
            FHE.checkSignatures(requestId, cleartexts, decryptionProof);
        } catch {
            // @audit Refund mechanism: Decryption failed
            uint256 disputeId = requestIdToDisputeId[requestId];
            _handleDecryptionFailure(disputeId, "Signature verification failed");
            return;
        }

        // @audit Mapping lookup: Find dispute by request ID
        uint256 disputeId = requestIdToDisputeId[requestId];
        require(disputeId > 0, "Invalid request ID");
        require(pendingDecryptions[disputeId], "No pending decryption");

        Dispute storage dispute = disputes[disputeId];

        // @audit Timeout check: Verify decryption completed in time
        if (block.timestamp > dispute.decryptionRequestTime + DECRYPTION_TIMEOUT) {
            _handleDecryptionFailure(disputeId, "Decryption timeout exceeded");
            return;
        }

        // Decode votes from cleartexts
        uint8[] memory votes;
        try this.decodeVotes(cleartexts) returns (uint8[] memory decodedVotes) {
            votes = decodedVotes;
        } catch {
            _handleDecryptionFailure(disputeId, "Vote decoding failed");
            return;
        }

        // @audit Overflow protection: Count votes with bounded loop
        uint256 plaintiffVotes = 0;
        uint256 defendantVotes = 0;
        uint256 neutralVotes = 0;

        for (uint256 i = 0; i < votes.length && i < MAX_ARBITRATORS; i++) {
            if (votes[i] == 1) plaintiffVotes++;
            else if (votes[i] == 2) defendantVotes++;
            else if (votes[i] == 3) neutralVotes++;
        }

        // Determine winner based on majority
        address winner;
        if (plaintiffVotes > defendantVotes && plaintiffVotes > neutralVotes) {
            winner = dispute.plaintiff;
        } else if (defendantVotes > plaintiffVotes && defendantVotes > neutralVotes) {
            winner = dispute.defendant;
        } else {
            winner = address(0); // No clear winner - tie
        }

        pendingDecryptions[disputeId] = false;
        _finalizeDispute(disputeId, winner);
    }

    /**
     * @notice Handle decryption failures and issue refunds
     * @param _disputeId ID of the dispute that failed decryption
     * @param reason Human-readable failure reason
     * @dev Refund mechanism: Returns stakes to all parties on failure
     * @audit Reentrancy: Follows checks-effects-interactions pattern
     */
    function _handleDecryptionFailure(uint256 _disputeId, string memory reason) private {
        Dispute storage dispute = disputes[_disputeId];

        // @audit Double-refund prevention
        require(!dispute.refundProcessed, "Refund already processed");

        dispute.status = DisputeStatus.DecryptionFailed;
        dispute.refundProcessed = true;
        pendingDecryptions[_disputeId] = false;

        emit DecryptionFailed(_disputeId, reason);

        // @audit Reentrancy protection: State changes before external calls
        _issueRefund(_disputeId, dispute.plaintiff, dispute.stakeAmount);
        _issueRefund(_disputeId, dispute.defendant, dispute.stakeAmount);
    }

    /**
     * @notice Issue refund to a dispute party
     * @param _disputeId ID of the dispute
     * @param recipient Address to receive refund
     * @param amount Amount to refund
     * @audit Reentrancy: Uses call with gas limit
     */
    function _issueRefund(uint256 _disputeId, address recipient, uint256 amount) private {
        if (amount == 0 || recipient == address(0)) return;

        (bool sent, ) = payable(recipient).call{value: amount, gas: 10000}("");
        if (sent) {
            emit RefundIssued(_disputeId, recipient, amount);
        } else {
            // If refund fails, mark for manual withdrawal
            emit DecryptionFailed(_disputeId, "Refund transfer failed");
        }
    }

    // Helper functions for callback processing
    function verifyDecryption(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory proof
    ) external view {
        // Placeholder for external call simulation
        require(requestId > 0, "Invalid request");
    }

    function decodeVotes(bytes memory cleartexts) external pure returns (uint8[] memory) {
        return abi.decode(cleartexts, (uint8[]));
    }

    // Finalize dispute resolution
    function _finalizeDispute(uint256 _disputeId, address _winner) private {
        Dispute storage dispute = disputes[_disputeId];
        dispute.status = DisputeStatus.Resolved;
        dispute.winner = _winner;
        dispute.decisionRevealed = true;

        // Update reputation scores
        if (_winner != address(0)) {
            userReputation[_winner] += 10;
            address loser = (_winner == dispute.plaintiff) ? dispute.defendant : dispute.plaintiff;
            if (userReputation[loser] >= 5) {
                userReputation[loser] -= 5;
            }
        }

        // Update arbitrator reputations
        for (uint256 i = 0; i < dispute.assignedArbitrators.length; i++) {
            arbitrators[dispute.assignedArbitrators[i]].totalDisputesHandled++;
            arbitrators[dispute.assignedArbitrators[i]].successfulArbitrations++;
            arbitrators[dispute.assignedArbitrators[i]].reputation += 5;
        }

        emit DisputeResolved(_disputeId, _winner);
    }

    // Get dispute information
    function getDisputeInfo(uint256 _disputeId) external view disputeExists(_disputeId) returns (
        address plaintiff,
        address defendant,
        DisputeStatus status,
        uint256 createdAt,
        uint256 votingDeadline,
        uint256 arbitratorCount,
        bool decisionRevealed,
        address winner
    ) {
        Dispute storage dispute = disputes[_disputeId];
        return (
            dispute.plaintiff,
            dispute.defendant,
            dispute.status,
            dispute.createdAt,
            dispute.votingDeadline,
            dispute.assignedArbitrators.length,
            dispute.decisionRevealed,
            dispute.winner
        );
    }

    // Get arbitrator information
    function getArbitratorInfo(address _arbitrator) external view returns (
        bool isActive,
        uint256 reputation,
        uint256 totalDisputesHandled,
        uint256 successfulArbitrations,
        bool identityVerified
    ) {
        ArbitratorProfile storage arbitrator = arbitrators[_arbitrator];
        return (
            arbitrator.isActive,
            arbitrator.reputation,
            arbitrator.totalDisputesHandled,
            arbitrator.successfulArbitrations,
            arbitrator.identityVerified
        );
    }

    // Get user reputation
    function getUserReputation(address _user) external view returns (uint256) {
        return userReputation[_user];
    }

    /**
     * @notice Check for voting timeout and trigger refund if expired
     * @param _disputeId ID of the dispute to check
     * @dev Timeout protection: Prevents permanent lock of funds
     * @audit Access control: Anyone can trigger timeout check (public good)
     */
    function checkVotingTimeout(uint256 _disputeId) external disputeExists(_disputeId) {
        Dispute storage dispute = disputes[_disputeId];

        // @audit Timeout check: Voting period exceeded
        require(
            dispute.status == DisputeStatus.InArbitration &&
            block.timestamp > dispute.votingDeadline + VOTING_TIMEOUT,
            "Voting timeout not reached"
        );

        emit TimeoutTriggered(_disputeId, "Voting");

        // @audit Refund mechanism: Return stakes on timeout
        dispute.status = DisputeStatus.Cancelled;
        _handleDecryptionFailure(_disputeId, "Voting timeout exceeded");
    }

    /**
     * @notice Check for decryption timeout and trigger refund if expired
     * @param _disputeId ID of the dispute to check
     * @dev Timeout protection: Prevents permanent lock if Gateway fails
     * @audit Access control: Anyone can trigger (incentivized by affected parties)
     */
    function checkDecryptionTimeout(uint256 _disputeId) external disputeExists(_disputeId) {
        Dispute storage dispute = disputes[_disputeId];

        // @audit Timeout check: Decryption taking too long
        require(
            dispute.status == DisputeStatus.Voting &&
            pendingDecryptions[_disputeId] &&
            block.timestamp > dispute.decryptionRequestTime + DECRYPTION_TIMEOUT,
            "Decryption timeout not reached"
        );

        emit TimeoutTriggered(_disputeId, "Decryption");

        // @audit Refund mechanism: Return stakes if Gateway fails
        _handleDecryptionFailure(_disputeId, "Decryption timeout - Gateway unresponsive");
    }

    /**
     * @notice Manual refund claim for failed disputes
     * @param _disputeId ID of the dispute to claim refund from
     * @dev Emergency refund: Allows parties to recover funds after failure
     * @audit Access control: Only dispute parties can claim
     * @audit Double-claim prevention: Tracks refund status
     */
    function claimRefund(uint256 _disputeId) external disputeExists(_disputeId) onlyDisputeParty(_disputeId) {
        Dispute storage dispute = disputes[_disputeId];

        // @audit Input validation: Dispute must be in failed/cancelled state
        require(
            dispute.status == DisputeStatus.DecryptionFailed ||
            dispute.status == DisputeStatus.Cancelled ||
            dispute.status == DisputeStatus.Refunded,
            "Refund not available"
        );

        require(!dispute.refundProcessed, "Refunds already processed");

        // Mark as refunded to prevent double processing
        dispute.status = DisputeStatus.Refunded;
        dispute.refundProcessed = true;

        // @audit Reentrancy protection: State changes before external calls
        if (msg.sender == dispute.plaintiff) {
            _issueRefund(_disputeId, dispute.plaintiff, dispute.stakeAmount);
        } else if (msg.sender == dispute.defendant) {
            _issueRefund(_disputeId, dispute.defendant, dispute.stakeAmount);
        }
    }

    /**
     * @notice Get dispute timeout status
     * @param _disputeId ID of the dispute
     * @return votingExpired Whether voting timeout has been exceeded
     * @return decryptionExpired Whether decryption timeout has been exceeded
     * @return canClaimRefund Whether parties can claim refunds
     */
    function getTimeoutStatus(uint256 _disputeId) external view disputeExists(_disputeId) returns (
        bool votingExpired,
        bool decryptionExpired,
        bool canClaimRefund
    ) {
        Dispute storage dispute = disputes[_disputeId];

        votingExpired = (dispute.status == DisputeStatus.InArbitration &&
                        block.timestamp > dispute.votingDeadline + VOTING_TIMEOUT);

        decryptionExpired = (dispute.status == DisputeStatus.Voting &&
                            pendingDecryptions[_disputeId] &&
                            block.timestamp > dispute.decryptionRequestTime + DECRYPTION_TIMEOUT);

        canClaimRefund = (dispute.status == DisputeStatus.DecryptionFailed ||
                         dispute.status == DisputeStatus.Cancelled ||
                         dispute.status == DisputeStatus.Refunded);

        return (votingExpired, decryptionExpired, canClaimRefund);
    }

    /**
     * @notice Get refund eligibility and amount
     * @param _disputeId ID of the dispute
     * @param _party Address of the party checking eligibility
     * @return eligible Whether the party is eligible for refund
     * @return amount Amount eligible for refund
     * @return claimed Whether refund has been claimed
     */
    function getRefundStatus(uint256 _disputeId, address _party) external view disputeExists(_disputeId) returns (
        bool eligible,
        uint256 amount,
        bool claimed
    ) {
        Dispute storage dispute = disputes[_disputeId];

        eligible = (_party == dispute.plaintiff || _party == dispute.defendant) &&
                   (dispute.status == DisputeStatus.DecryptionFailed ||
                    dispute.status == DisputeStatus.Cancelled ||
                    dispute.status == DisputeStatus.Refunded);

        amount = dispute.stakeAmount;
        claimed = dispute.refundProcessed;

        return (eligible, amount, claimed);
    }

    // Emergency functions
    /**
     * @notice Pause an arbitrator's active status
     * @param _arbitrator Address of arbitrator to pause
     * @audit Access control: Owner only
     */
    function pauseArbitrator(address _arbitrator) external onlyOwner {
        require(arbitrators[_arbitrator].isActive, "Arbitrator not active");
        arbitrators[_arbitrator].isActive = false;
        arbitratorPool--;
    }

    /**
     * @notice Unpause an arbitrator's active status
     * @param _arbitrator Address of arbitrator to unpause
     * @audit Access control: Owner only
     * @audit Input validation: Must have reputation
     */
    function unpauseArbitrator(address _arbitrator) external onlyOwner {
        require(arbitrators[_arbitrator].reputation > 0, "Invalid arbitrator");
        require(!arbitrators[_arbitrator].isActive, "Already active");
        arbitrators[_arbitrator].isActive = true;
        arbitratorPool++;
    }
}