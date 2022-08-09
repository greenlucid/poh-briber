import { useWeb3React } from "@web3-react/core"
import { ethers } from "ethers"
import { useState } from "react"
import { getPohBriberAddress } from "../App"
import abi from "../abi.json"

const Create = () => {
  const [metadata, setMetadata] = useState<string | undefined>()
  const [auctionPeriod, setAuctionPeriod] = useState<number | undefined>()
  const [optionPeriod, setOptionPeriod] = useState<number | undefined>()
  const web3 = useWeb3React()

  const createAuctionHandler = async () => {
    const pohBriber = new ethers.Contract(
      getPohBriberAddress(web3.chainId as number),
      abi,
      web3.library.getSigner()
    )
    pohBriber.createAuction(metadata, auctionPeriod, optionPeriod)
  }

  return (
    <div>
      <p>metadata (actually this is just the proposalId)</p>
      <input
        value={metadata}
        onChange={(event) => {
          setMetadata(event.target.value)
        }}
      />
      <p>auction period</p>
      <input
        value={auctionPeriod}
        onChange={(event) => {
          setAuctionPeriod(Number(event.target.value))
        }}
      />
      <p>option period</p>
      <input
        value={optionPeriod}
        onChange={(event) => {
          setOptionPeriod(Number(event.target.value))
        }}
      />
      <p>Ready to submit the auction?!?!</p>
      <button
        onClick={() => {
          createAuctionHandler()
        }}
      >
        Submit!!!!
      </button>
    </div>
  )
}

export default Create
