import { QueryClient } from '@tanstack/react-query'
import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { baseAccount, injected } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    baseAccount({
      appName: 'DoneDot',
    }),
    injected(),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
})

export const queryClient = new QueryClient()

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
