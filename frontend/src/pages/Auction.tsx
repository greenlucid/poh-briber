import { useWeb3React } from "@web3-react/core"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { getPohBriberAddress } from "../App"
import { Auction } from "./Home"
import abi from "../abi.json"
import shorten from "../utils/shorten"
import { useMatch } from "react-router-dom"
import humanizeAmount from "../utils/humanizeAmount"
import explorerLink from "../utils/explorerLink"
import dehumanizeAmount from "../utils/dehumanizeAmount"
import getBribees from "../utils/getBribees"

const AuctionInfo: React.FC<{ auction: Auction; chainId: number }> = ({
  auction,
  chainId,
}) => {
  return (
    <div>
      <a href={`/#/auction/${auction.index}`}>
        <h3>auction #{auction.index}</h3>
      </a>
      <ul>
        <li>
          proposal:{" "}
          <a
            href={`https://snapshot.org/#/poh.eth/proposal/${auction.proposalId}`}
          >
            {shorten(auction.proposalId)}
          </a>
        </li>
        <li>Highest Bid: {humanizeAmount(auction.highBid)} xDAI</li>
        <li>Second Bid: {humanizeAmount(auction.secondBid)} xDAI</li>
        <li>
          Current winner :{" "}
          <a href={explorerLink(chainId as number, auction.winner)}>
            {shorten(auction.winner)}
          </a>
        </li>
        <li>
          Auction ends in:{" "}
          {new Date(auction.auctionDeadlineTimestamp * 1000).toUTCString()}
        </li>
        <li>
          Setting option ends in:{" "}
          {new Date(auction.optionDeadlineTimestamp * 1000).toUTCString()}
        </li>
        <li>
          Current option index: {auction.currentOptionIndex} (go to snapshot to
          figure out what it means)
        </li>
      </ul>
    </div>
  )
}

const OptionControl: React.FC<{ auction: Auction }> = ({ auction }) => {
  const web3 = useWeb3React()
  const [option, setOption] = useState<number>(0)

  if (new Date().valueOf() / 1000 >= auction.optionDeadlineTimestamp) {
    return <div>too late, the option cannot be changed anymore</div>
  }

  const handleChangeOption = async () => {
    const pohBriber = new ethers.Contract(
      getPohBriberAddress(web3.chainId as number),
      abi,
      web3.library.getSigner()
    )
    pohBriber.setOption(auction.index, option)
  }

  return (
    <div>
      <p>you are the winner, you can set the option</p>
      <input
        type="number"
        value={option}
        onChange={(event) => setOption(Number(event.target.value))}
      />
      <button onClick={() => handleChangeOption()}>Set Option</button>
    </div>
  )
}

const BidControl: React.FC<{ auction: Auction }> = ({ auction }) => {
  const [amount, setAmount] = useState<number>(humanizeAmount(auction.highBid))
  const web3 = useWeb3React()

  if (new Date().valueOf() / 1000 >= auction.auctionDeadlineTimestamp) {
    return <div>too late, you cannot bid anymore.</div>
  }

  const handleBid = async () => {
    const pohBriber = new ethers.Contract(
      getPohBriberAddress(web3.chainId as number),
      abi,
      web3.library.getSigner()
    )
    pohBriber.bid(auction.index, { value: dehumanizeAmount(amount) })
  }

  return (
    <div>
      <p>you can bid. bid more than the current high bid, or it reverts</p>
      <input
        type="number"
        value={amount}
        onChange={(event) => setAmount(Number(event.target.value))}
      />
      <button onClick={() => handleBid()}>Bid (xDAIs)</button>
    </div>
  )
}

const AuctionControl: React.FC<{ auction: Auction }> = ({ auction }) => {
  const web3 = useWeb3React()

  if (web3.account === auction.winner) {
    return <OptionControl auction={auction} />
  }

  return <BidControl auction={auction} />
}

const DistributeControl: React.FC<{ auction: Auction }> = ({ auction }) => {
  const [briber, setBriber] = useState<string | undefined>()
  const web3 = useWeb3React()

  useEffect(() => {
    if (web3.active) {
      const pohBriber = new ethers.Contract(
        getPohBriberAddress(web3.chainId as number),
        abi,
        web3.library
      )
      pohBriber.briber().then((result: any) => setBriber(result))
    }
  }, [web3.account, web3.active])

  const handleDistribution = async () => {
    const bribees = await getBribees({
      briber: briber as string,
      proposalId: auction.proposalId,
    })
    console.log("bribees:", bribees)
    const pohBriber = new ethers.Contract(
      getPohBriberAddress(web3.chainId as number),
      abi,
      web3.library.getSigner()
    )
    pohBriber.distributeRewards(auction.index, bribees)
  }

  if (briber === undefined) {
    return <div>loading...</div>
  }

  if (briber !== web3.account) {
    return null
  }

  return (
    <button
      onClick={() => handleDistribution()}
    >
      Distribute
    </button>
  )
}

const AuctionDetailed: React.FC = () => {
  const [auction, setAuction] = useState<Auction | undefined>()
  const { auctionId } = useMatch("auction/:auctionId")?.params as any
  const web3 = useWeb3React()

  const handleAuctionQuery = async (index: number) => {
    if (!web3.active) return

    const pohBriber = new ethers.Contract(
      getPohBriberAddress(web3.chainId as number),
      abi,
      web3.library
    )

    const result = await pohBriber.auctions(index)
    // https://blockscout.com/poa/sokol/api/eth-rpc

    const auction: Auction = {
      index: index,
      auctionDeadlineTimestamp: result.auctionDeadline.toNumber(),
      distributed: result.distributed,
      currentOptionIndex: result.option.toNumber(),
      highBid: result.highBid,
      secondBid: result.secondBid,
      optionDeadlineTimestamp: result.optionDeadline.toNumber(),
      proposalId: result.metadata,
      winner: result.winner,
    }
    setAuction(auction)
  }

  useEffect(() => {
    if (auctionId !== undefined) handleAuctionQuery(auctionId)
  }, [auctionId, web3.active])

  if (auction === undefined || !web3.active) return <div>loading</div>

  return (
    <div>
      <AuctionInfo auction={auction} chainId={web3.chainId as number} />
      <AuctionControl auction={auction} />
      <DistributeControl auction={auction} />
    </div>
  )
}

export default AuctionDetailed
