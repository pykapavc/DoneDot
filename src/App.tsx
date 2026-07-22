import { type CSSProperties, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Copy,
  Dumbbell,
  ExternalLink,
  HandHeart,
  Paintbrush,
  PackageCheck,
  RefreshCcw,
  Wallet,
} from 'lucide-react'
import { zeroAddress } from 'viem'
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { base } from 'wagmi/chains'
import {
  DONEDOT_ADDRESS,
  doneDotAbi,
  isContractConfigured,
} from './config/contract'

const actions = [
  {
    id: 0,
    label: 'Shipped',
    verb: 'ship',
    detail: 'Released something real.',
    icon: PackageCheck,
    color: '#2563eb',
  },
  {
    id: 1,
    label: 'Learned',
    verb: 'learn',
    detail: 'Closed a knowledge loop.',
    icon: BookOpen,
    color: '#059669',
  },
  {
    id: 2,
    label: 'Moved',
    verb: 'move',
    detail: 'Took care of the body.',
    icon: Dumbbell,
    color: '#dc2626',
  },
  {
    id: 3,
    label: 'Created',
    verb: 'create',
    detail: 'Made a new piece.',
    icon: Paintbrush,
    color: '#9333ea',
  },
  {
    id: 4,
    label: 'Helped',
    verb: 'help',
    detail: 'Gave someone leverage.',
    icon: HandHeart,
    color: '#ea580c',
  },
  {
    id: 5,
    label: 'Reset',
    verb: 'reset',
    detail: 'Cleared the deck.',
    icon: RefreshCcw,
    color: '#0f766e',
  },
] as const

const emptyStats = [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n] as const

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatDate(timestamp: number) {
  if (!timestamp) return 'No dots yet'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp * 1000))
}

export function App() {
  const [selectedKind, setSelectedKind] = useState(0)
  const [copied, setCopied] = useState(false)
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connectors, connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const {
    data: hash,
    error: writeError,
    isPending: isWriting,
    writeContract,
  } = useWriteContract()
  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  })

  const userAddress = address ?? zeroAddress
  const {
    data: statsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useReadContract({
    address: DONEDOT_ADDRESS,
    abi: doneDotAbi,
    functionName: 'statsOf',
    args: [userAddress],
    query: {
      enabled: isContractConfigured && isConnected,
    },
  })
  const {
    data: totalDotsData,
    refetch: refetchTotalDots,
  } = useReadContract({
    address: DONEDOT_ADDRESS,
    abi: doneDotAbi,
    functionName: 'totalDots',
    query: {
      enabled: isContractConfigured,
    },
  })

  useEffect(() => {
    if (isSuccess) {
      void refetchStats()
      void refetchTotalDots()
    }
  }, [isSuccess, refetchStats, refetchTotalDots])

  const stats = statsData ?? emptyStats
  const total = Number(stats[0])
  const lastStampedAt = Number(stats[1])
  const lastKind = Number(stats[2])
  const counts = actions.map((action, index) => ({
    ...action,
    count: Number(stats[index + 3] ?? 0n),
  }))
  const selectedAction = actions.find((action) => action.id === selectedKind) ?? actions[0]
  const SelectedIcon = selectedAction.icon
  const lastAction = total > 0 ? actions[lastKind]?.label ?? 'Unknown' : 'None'
  const globalTotal = Number(totalDotsData ?? 0n)
  const needsSwitch = isConnected && chainId !== base.id
  const canStamp =
    isContractConfigured &&
    isConnected &&
    !needsSwitch &&
    !isWriting &&
    !isConfirming

  const primaryConnector = connectors.find(
    (connector) => connector.id === 'baseAccount',
  )
  const visibleConnectors = useMemo(() => {
    if (primaryConnector) {
      return [
        primaryConnector,
        ...connectors.filter((connector) => connector.id !== 'baseAccount'),
      ]
    }

    return connectors
  }, [connectors, primaryConnector])

  function handleStamp() {
    if (!isContractConfigured) return

    writeContract({
      address: DONEDOT_ADDRESS,
      abi: doneDotAbi,
      functionName: 'stamp',
      args: [selectedKind],
      chainId: base.id,
    })
  }

  async function handleCopyAddress() {
    await navigator.clipboard.writeText(DONEDOT_ADDRESS)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  const walletError =
    writeError && 'shortMessage' in writeError
      ? String(writeError.shortMessage)
      : writeError?.message

  return (
    <main className="app-shell">
      <section className="hero">
        <nav className="topbar" aria-label="DoneDot wallet controls">
          <div className="brand">
            <span className="brand-mark">D</span>
            <span>DoneDot</span>
          </div>

          {isConnected && address ? (
            <div className="wallet-pill">
              <span>{shortAddress(address)}</span>
              <button type="button" onClick={() => disconnect()}>
                Disconnect
              </button>
            </div>
          ) : (
            <div className="connectors">
              {visibleConnectors.map((connector) => (
                <button
                  type="button"
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  disabled={isConnecting}
                >
                  <Wallet size={16} />
                  {connector.id === 'baseAccount'
                    ? 'Base Account'
                    : connector.name}
                </button>
              ))}
            </div>
          )}
        </nav>

        <div className="hero-grid">
          <div className="intro">
            <p className="eyebrow">Small wins, placed on Base</p>
            <h1>Put a dot on what got done.</h1>
            <p className="summary">
              A lightweight onchain done journal. No token, no mint, no fee
              beyond Base gas.
            </p>

            <div className="contract-chip">
              <span>Contract</span>
              <code>
                {isContractConfigured
                  ? shortAddress(DONEDOT_ADDRESS)
                  : 'not configured'}
              </code>
              {isContractConfigured && (
                <button
                  type="button"
                  aria-label="Copy contract address"
                  onClick={handleCopyAddress}
                >
                  <Copy size={15} />
                </button>
              )}
              {copied && <small>Copied</small>}
            </div>
          </div>

          <div className="stamp-panel" aria-label="Create a DoneDot stamp">
            {!isContractConfigured && (
              <div className="setup-warning">
                <AlertTriangle size={18} />
                Add your deployed contract address to
                VITE_DONEDOT_CONTRACT_ADDRESS.
              </div>
            )}

            <div className="action-header">
              <div>
                <span>Selected dot</span>
                <strong>{selectedAction.label}</strong>
              </div>
              <SelectedIcon
                className="selected-icon"
                style={{ color: selectedAction.color }}
                size={34}
              />
            </div>

            <div className="action-grid" role="list">
              {actions.map((action) => {
                const Icon = action.icon
                const isSelected = selectedKind === action.id

                return (
                  <button
                    type="button"
                    role="listitem"
                    className={isSelected ? 'action active' : 'action'}
                    key={action.id}
                    onClick={() => setSelectedKind(action.id)}
                    style={{ '--accent': action.color } as CSSProperties}
                    aria-pressed={isSelected}
                  >
                    <Icon size={20} />
                    <span>{action.label}</span>
                    <small>{action.detail}</small>
                  </button>
                )
              })}
            </div>

            {needsSwitch ? (
              <button
                type="button"
                className="stamp-button"
                onClick={() => switchChain({ chainId: base.id })}
                disabled={isSwitching}
              >
                {isSwitching ? 'Switching...' : 'Switch to Base'}
              </button>
            ) : (
              <button
                type="button"
                className="stamp-button"
                onClick={handleStamp}
                disabled={!canStamp}
              >
                {isWriting
                  ? 'Confirm in wallet...'
                  : isConfirming
                    ? 'Stamping on Base...'
                    : `Stamp ${selectedAction.verb}`}
              </button>
            )}

            {isSuccess && (
              <div className="success-line">
                <CheckCircle2 size={17} />
                Dot stamped.
                {hash && (
                  <a
                    href={`https://basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    BaseScan <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}

            {writeError && (
              <div className="error-line">{walletError}</div>
            )}
          </div>
        </div>
      </section>

      <section className="stats-band" aria-label="DoneDot stats">
        <div className="metric">
          <span>Your dots</span>
          <strong>{isStatsLoading ? '...' : total}</strong>
        </div>
        <div className="metric">
          <span>Last dot</span>
          <strong>{lastAction}</strong>
          <small>{formatDate(lastStampedAt)}</small>
        </div>
        <div className="metric">
          <span>All dots</span>
          <strong>{globalTotal}</strong>
        </div>
      </section>

      <section className="ledger" aria-label="Category ledger">
        <div className="section-heading">
          <span>Personal ledger</span>
          <strong>Dots by kind</strong>
        </div>

        <div className="ledger-grid">
          {counts.map((action) => {
            const Icon = action.icon

            return (
              <div className="ledger-item" key={action.id}>
                <span style={{ color: action.color }}>
                  <Icon size={21} />
                </span>
                <div>
                  <strong>{action.count}</strong>
                  <small>{action.label}</small>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
