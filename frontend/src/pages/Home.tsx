import { useEffect, useState } from "react"
import { BigNumber, ethers } from "ethers"
import { useWeb3React } from "@web3-react/core"
import { getPohBriberAddress } from "../App"
import abi from "../abi.json"
import shorten from "../utils/shorten"

export interface Auction {
  proposalId: string
  index: number
  highBid: BigNumber
  secondBid: BigNumber
  auctionDeadlineTimestamp: number
  optionDeadlineTimestamp: number
  winner: string //address,
  currentOptionIndex: number
  distributed: boolean
}

const AuctionC: React.FC<{ auction: Auction }> = ({ auction }) => {
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
      </ul>
    </div>
  )
}

const Home = () => {
  const [auctionCount, setAuctionCount] = useState<undefined | number>()
  const [queriedAuction, setQueriedAuction] = useState<undefined | number>()
  const [auctions, setAuctions] = useState<Auction[]>([])
  const web3 = useWeb3React()

  useEffect(() => {
    if (web3.active) {
      const pohBriber = new ethers.Contract(
        getPohBriberAddress(web3.chainId as number),
        abi,
        web3.library
      )
      pohBriber.auctionCount().then((result: any) => {
        setAuctionCount(result.toNumber())
        setQueriedAuction(result.toNumber() - 1)
      })
    }
  }, [web3.account, web3.active])

  const handleAuctionQuery = async (index: number) => {
    const pohBriber = new ethers.Contract(
      getPohBriberAddress(web3.chainId as number),
      abi,
      web3.library
    )
    pohBriber.auctions(index).then((result: any) => {
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
      setAuctions([auction, ...auctions])
      setQueriedAuction(index - 1)
    })
  }

  useEffect(() => {
    if (auctionCount !== undefined && queriedAuction !== -1) {
      handleAuctionQuery(queriedAuction as number)
    }
  }, [queriedAuction])

  return (
    <div>
      <h1>Home</h1>
      <p>
        Hello! If you are not interested in auctioning the votes, and you only
        want to obtain the bribe, please{" "}
        <a href="https://github.com/greenlucid/poh-briber/blob/master/GUIDE.md">
          <b style={{ fontSize: 30, color: "green" }}>click on this Guide</b>
        </a>{" "}
        and follow the instructions to delegate to me in Snapshot. Once you
        delegate to me, you're already eligible to obtain the bribes, and you
        don't need to do anything else!
      </p>
      <p>
        If you want to interact with the auctions, please connect to Gnosis
        Chain. Then, you will be able to see the auctions.
      </p>
      {auctionCount !== undefined && <p>Auctions: {auctionCount.toString()}</p>}
      {auctions
        .slice()
        .reverse()
        .map((auction) => (
          <AuctionC auction={auction} key={auction.index} />
        ))}
    </div>
  )
}

export default Home
