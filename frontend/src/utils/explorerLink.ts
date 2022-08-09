const explorerLink = (chainId: number, address: string): string => {
  const explorerRoot =
    chainId === 100
      ? "https://blockscout.com/xdai/mainnet/address/"
      : "https://blockscout.com/poa/sokol/address/"
  return explorerRoot + address
}

export default explorerLink
