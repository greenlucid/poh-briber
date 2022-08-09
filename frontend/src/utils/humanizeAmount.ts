import { BigNumber } from "ethers"

const humanizeAmount = (bn: BigNumber): number => {
  return bn.div(BigNumber.from("1000000000000000")).toNumber() / 1000
}

export default humanizeAmount