import { BigNumber } from "ethers"

const dehumanizeAmount = (n: number): BigNumber => {
  return BigNumber.from(n * 1000).mul("1000000000000000")
}

export default dehumanizeAmount