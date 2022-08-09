const shorten = (str: string): string => {
  if (str.length < 13) return str
  return `${str.substring(0, 6)}...${str.substring(str.length - 4, str.length)}`
}

export default shorten
