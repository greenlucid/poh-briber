import { useWeb3React } from "@web3-react/core"
import { useEffect, useState } from "react"
import { HashRouter, Routes, Route, Link } from "react-router-dom"
import AuctionDetailed from "./pages/Auction"
import Create from "./pages/Create"
import Home from "./pages/Home"

import abi from "./abi.json"

import { InjectedConnector } from "@web3-react/injected-connector"
import { ethers } from "ethers"
import shorten from "./utils/shorten"
import explorerLink from "./utils/explorerLink"
const Injected = new InjectedConnector({ supportedChainIds: [77, 100] })

export const getPohBriberAddress = (chainId: number) => {
  return chainId === 100
    ? process.env.REACT_APP_POH_BRIBER_ADDRESS as string
    : process.env.REACT_APP_POH_BRIBER_ADDRESS_TESTNET as string
}

const AppBar = () => {
  const [briber, setBriber] = useState<string | undefined>()
  const web3 = useWeb3React()

  useEffect(() => {
    web3.activate(Injected)
  }, [])

  const pohBriberAddress = getPohBriberAddress(web3.chainId as number)

  useEffect(() => {
    if (web3.active) {
      const pohBriber = new ethers.Contract(
        pohBriberAddress as string,
        abi,
        web3.library
      )
      pohBriber.briber().then((result: any) => setBriber(result))
    }
  }, [web3.account, web3.active])

  return (
    <div className="appbar">
      {web3.error && (
        <span>
          Error: Connect your Injected Provider to Gnosis Chain, chainId = 100
        </span>
      )}
      <Link to={"/"}>Home</Link>
      {briber && web3 && briber === web3.account && (
        <Link to={"create"}>Create</Link>
      )}
      {web3.account && (
        <a href={explorerLink(web3.chainId as number, web3.account)}>
          you: {shorten(web3.account)}
        </a>
      )}
      {web3.active && (
        <a
          href={explorerLink(
            web3.chainId as number,
            pohBriberAddress as string
          )}
        >
          contract: {shorten(pohBriberAddress as string)}
        </a>
      )}
      <a href="https://github.com/greenlucid/poh-briber/blob/master/GUIDE.md">[Help me!]</a>
    </div>
  )
}

const App = () => {
  return (
    <div>
      <HashRouter>
        <AppBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="auction/*" element={<AuctionDetailed />} />
          <Route path="create" element={<Create />} />
        </Routes>
      </HashRouter>
    </div>
  )
}

export default App
