import { BrowserProvider } from "ethers"
import { MONAD_TESTNET } from "./monad"

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void
    }
  }
}

export async function getProvider(): Promise<BrowserProvider> {
  if (!window.ethereum) throw new Error("No wallet detected. Install MetaMask.")
  return new BrowserProvider(window.ethereum)
}

export async function ensureMonadTestnet(provider: BrowserProvider): Promise<void> {
  const net = await provider.getNetwork()
  if (Number(net.chainId) === MONAD_TESTNET.chainId) return
  try {
    await provider.send("wallet_switchEthereumChain", [
      { chainId: MONAD_TESTNET.chainIdHex },
    ])
  } catch {
    await provider.send("wallet_addEthereumChain", [
      {
        chainId: MONAD_TESTNET.chainIdHex,
        chainName: MONAD_TESTNET.name,
        rpcUrls: [MONAD_TESTNET.rpcUrl],
        nativeCurrency: MONAD_TESTNET.currency,
        blockExplorerUrls: [MONAD_TESTNET.explorerUrl],
      },
    ])
  }
}

export async function connectWallet(): Promise<string> {
  const provider = await getProvider()
  await ensureMonadTestnet(provider)
  const signer = await provider.getSigner()
  return signer.address
}

export async function inscribeFortuneOnChain(
  fortuneId: number,
  fortuneText: string
): Promise<string> {
  const provider = await getProvider()
  await ensureMonadTestnet(provider)
  const signer = await provider.getSigner()

  // Write a simple zero-value tx with fortune metadata as hex data
  const data =
    "0x" +
    Buffer.from(JSON.stringify({ fortuneId, text: fortuneText.slice(0, 80) })).toString(
      "hex"
    )

  const tx = await signer.sendTransaction({
    to: await signer.getAddress(),
    value: BigInt(0),
    data,
  })

  return tx.hash
}
