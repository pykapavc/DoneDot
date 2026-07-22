// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DoneDot {
    uint8 public constant SHIPPED = 0;
    uint8 public constant LEARNED = 1;
    uint8 public constant MOVED = 2;
    uint8 public constant CREATED = 3;
    uint8 public constant HELPED = 4;
    uint8 public constant RESET = 5;
    uint8 public constant KIND_COUNT = 6;

    string public constant name = "DoneDot";
    string public constant version = "1.0.0";

    struct Profile {
        uint64 total;
        uint64 lastStampedAt;
        uint8 lastKind;
        mapping(uint8 => uint64) counts;
    }

    mapping(address => Profile) private profiles;
    uint64 public totalDots;

    event DotStamped(
        address indexed user,
        uint8 indexed kind,
        uint64 userTotal,
        uint64 kindTotal,
        uint64 timestamp
    );

    error InvalidKind();

    function stamp(uint8 kind) external {
        if (kind >= KIND_COUNT) revert InvalidKind();

        Profile storage profile = profiles[msg.sender];
        uint64 timestamp = uint64(block.timestamp);

        profile.total += 1;
        profile.lastStampedAt = timestamp;
        profile.lastKind = kind;
        profile.counts[kind] += 1;
        totalDots += 1;

        emit DotStamped(
            msg.sender,
            kind,
            profile.total,
            profile.counts[kind],
            timestamp
        );
    }

    function statsOf(address user)
        external
        view
        returns (
            uint64 total,
            uint64 lastStampedAt,
            uint8 lastKind,
            uint64 shipped,
            uint64 learned,
            uint64 moved,
            uint64 created,
            uint64 helped,
            uint64 reset
        )
    {
        Profile storage profile = profiles[user];

        return (
            profile.total,
            profile.lastStampedAt,
            profile.lastKind,
            profile.counts[SHIPPED],
            profile.counts[LEARNED],
            profile.counts[MOVED],
            profile.counts[CREATED],
            profile.counts[HELPED],
            profile.counts[RESET]
        );
    }

    function countOf(address user, uint8 kind) external view returns (uint64) {
        if (kind >= KIND_COUNT) revert InvalidKind();
        return profiles[user].counts[kind];
    }
}
