import type { Address } from 'viem'

const configuredAddress = import.meta.env.VITE_DONEDOT_CONTRACT_ADDRESS
const deployedContractAddress = '0xFFdFA35abd77A776D6B84d8d214F7a151C6d0953'

export const isContractConfigured =
  /^0x[a-fA-F0-9]{40}$/.test(configuredAddress ?? '') &&
  configuredAddress !== zeroContractAddress

export const DONEDOT_ADDRESS = (
  isContractConfigured ? configuredAddress : zeroContractAddress
) as Address

export const doneDotAbi = [
  {
    type: 'function',
    name: 'stamp',
    inputs: [{ name: 'kind', type: 'uint8' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'statsOf',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'total', type: 'uint64' },
      { name: 'lastStampedAt', type: 'uint64' },
      { name: 'lastKind', type: 'uint8' },
      { name: 'shipped', type: 'uint64' },
      { name: 'learned', type: 'uint64' },
      { name: 'moved', type: 'uint64' },
      { name: 'created', type: 'uint64' },
      { name: 'helped', type: 'uint64' },
      { name: 'reset', type: 'uint64' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalDots',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
    stateMutability: 'view',
  },
] as const
