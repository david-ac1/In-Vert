// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title SustainabilityRegistry
 * @notice On-chain registry for In-Vert Proof-of-Sustainability attestations.
 *         Deployed on Hedera Smart Contract Service (HSCS). Each verified
 *         sustainability action is recorded here with its proof hash, creating
 *         an immutable, queryable audit trail alongside the HCS topic stream.
 */
contract SustainabilityRegistry {
    struct Attestation {
        bytes32 proofHash;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Attestation) private attestations;
    uint256 public totalAttestations;
    address public owner;

    event AttestationRegistered(
        string indexed actionId,
        bytes32 proofHash,
        uint256 timestamp
    );

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "SustainabilityRegistry: caller is not owner");
        _;
    }

    /**
     * @notice Register a verified sustainability attestation on-chain.
     * @param actionId  Unique action ID (e.g. "act_abc123")
     * @param proofHash SHA-256 proof hash of the verified action metadata
     */
    function registerAttestation(string calldata actionId, bytes32 proofHash) external onlyOwner {
        require(bytes(actionId).length > 0, "SustainabilityRegistry: empty actionId");
        require(!attestations[actionId].exists, "SustainabilityRegistry: already registered");

        attestations[actionId] = Attestation({
            proofHash: proofHash,
            timestamp: block.timestamp,
            exists: true
        });

        totalAttestations++;

        emit AttestationRegistered(actionId, proofHash, block.timestamp);
    }

    /**
     * @notice Retrieve an attestation by action ID.
     * @return proofHash  The proof hash stored for this action
     * @return timestamp  Block timestamp when the attestation was registered
     * @return exists     Whether this action has been registered
     */
    function getAttestation(string calldata actionId)
        external
        view
        returns (bytes32 proofHash, uint256 timestamp, bool exists)
    {
        Attestation memory a = attestations[actionId];
        return (a.proofHash, a.timestamp, a.exists);
    }

    /**
     * @notice Transfer contract ownership to a new address.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SustainabilityRegistry: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
