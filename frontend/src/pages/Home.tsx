import { useEffect } from "react"
import getBribees from "../utils/getBribees"

const Home = () => {

  useEffect(() => {
    getBribees({
      briber: "0x89c4acb8b5b5b8e5b2121934b9e143569a914c80",
      proposalId: "0xfbe25701bbee2f770fa32e12a513e0f66a83dec651ee90f9181c6b0cc11b3901"
    })
  }, [])

  return (
    <div>home</div>
  )
}

export default Home