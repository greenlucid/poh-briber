import { ethers } from "ethers"

interface GetBribeesArgs {
  proposalId: string
  briber: string
}

interface Delegation {
  id: string
  delegator: string
  space: string
  delegate: string
  timestamp: number
}

interface Proposal {
  id: string
  start: number
  end: number
  snapshot: string // block number of snapshot
}

const headers = new Headers()
headers.set("Content-Type", "application/json")

export const getVp = async (id: string, briber: string): Promise<number> => {
  const subgraphQuery = {
    query: `
      {
        vp(voter: "${briber}", space: "poh.eth", proposal: "${id}") {
          vp
        }
      }
    `,
  }
  const response = await fetch(
    process.env.REACT_APP_SNAPSHOT_GRAPHQLAPI as string,
    {
      method: "POST",
      headers: headers,
      body: JSON.stringify(subgraphQuery),
    }
  )
  const flane = await response.json()
  console.log("flane", flane)
  const stringedVp =  flane.data.vp as {vp: string}
  return Number(stringedVp.vp) 
}

const getProposal = async (id: string): Promise<Proposal> => {
  const subgraphQuery = {
    query: `
      {
        proposal(id: "${id}") {
          id
          start
          end
          quorum
          snapshot
          state
          scores_state
          votes
          scores
          strategies {
            params
          }
          choices
        }
      }
    `,
  }
  const response = await fetch(
    process.env.REACT_APP_SNAPSHOT_GRAPHQLAPI as string,
    {
      method: "POST",
      headers: headers,
      body: JSON.stringify(subgraphQuery),
    }
  )

  const { data } = await response.json()
  return data.proposal as Proposal
}

const getBlockTimestamp = async (blockNumber: number): Promise<number> => {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.REACT_APP_INFURA_RPC as string
  )
  const timestamp = (await provider.getBlock(blockNumber)).timestamp
  return timestamp
}

const getDelegations = async ({
  timestamp,
  briber,
}: {
  timestamp: number
  briber: string
}): Promise<Delegation[]> => {
  const subgraphQuery = {
    query: `
      {
        delegations(where: {space_in: ["", "poh.eth"],
            delegate: "${briber}",
            timestamp_lt: ${timestamp}})
        {
          id
          delegator
          space
          delegate
          timestamp
        }
      }
    `,
  }
  const response = await fetch(
    process.env.REACT_APP_SNAPSHOT_SUBGRAPH as string,
    {
      method: "POST",
      body: JSON.stringify(subgraphQuery),
    }
  )

  const { data } = await response.json()
  const preDelegations = data.delegations as Delegation[]
  const preDelegators = preDelegations.map((del) => del.delegator)
  const preDelegatorsArrString = `[${preDelegators
    .map((del) => `"${del}"`)
    .join(",")}]`

  const sandwichedDelegationsQuery = {
    query: `
      {
        delegations(where: {space_in: ["", "poh.eth"],
            delegator_in: ${preDelegatorsArrString}
            timestamp_lt: ${timestamp}})
        {
          id
          delegator
          space
          delegate
          timestamp
        }
      }
    `,
  }

  const sandwichResponse = await fetch(
    process.env.REACT_APP_SNAPSHOT_SUBGRAPH as string,
    {
      method: "POST",
      body: JSON.stringify(sandwichedDelegationsQuery),
    }
  )

  const { data: sandwichData } = await sandwichResponse.json()
  const sandwichDelegations = sandwichData.delegations as Delegation[]
  // get the delegations such that timestamp is maximum, per delegator. discard other delegations.
  const lastDelegations: Delegation[] = []
  for (const delegation of sandwichDelegations) {
    const matchDelegationIndex = lastDelegations.findIndex(
      (del) => del.delegator == delegation.delegator
    )
    if (matchDelegationIndex === -1) {
      lastDelegations.push(delegation)
    } else if (
      lastDelegations[matchDelegationIndex].timestamp < delegation.timestamp
    ) {
      // this doesnt really work if delegator delegates twice in the same block
      // but whatever, this is gonna need a custom subgraph to work properly
      lastDelegations[matchDelegationIndex] = delegation
    }
  }

  const activeBribedDelegations = []
  for (const delegation of lastDelegations) {
    const preDelegation = preDelegations.find(
      (del) => del.delegator == delegation.delegator
    )
    if (preDelegation && delegation.timestamp <= preDelegation.timestamp)
      activeBribedDelegations.push(delegation)
  }

  return activeBribedDelegations
}

/**
 * not actually correct, but close enough.
 * the proper way would be checking the voting power at the snapshot
 * but snapshot graphqlapi's `vp` only checks one, cannot check many.
 * i rather have this faster while losing some correctness
 */
const filterToPowered = async ({
  delegations,
}: {
  delegations: Delegation[]
}): Promise<string[]> => {
  const delegators = delegations.map((del) => del.delegator)
  const delegatorsArrString = `[${delegators
    .map((del) => `"${del}"`)
    .join(",")}]`

  const subgraphQuery = {
    query: `
      {
        submissions(where: { registered: true, removed: false, id_in: ${delegatorsArrString}}) {
          id
        }
      }
    `,
  }
  const response = await fetch(
    process.env.REACT_APP_PROOF_OF_HUMANITY_SUBGRAPH as string,
    {
      method: "POST",
      headers: headers,
      body: JSON.stringify(subgraphQuery),
    }
  )

  const { data } = await response.json()
  const submissions = data.submissions as { id: string }[]
  const poweredDelegators = submissions.map((submission) => submission.id)
  return poweredDelegators
}

const getTraitors = async ({
  delegators,
  proposal,
}: {
  delegators: string[]
  proposal: Proposal
}): Promise<string[]> => {
  const delegatorsArrString = `[${delegators
    .map((del) => `"${del}"`)
    .join(",")}]`
  const subgraphQuery = {
    query: `
      {
        votes (
          first: 1000
          where: {
            voter_in: ${delegatorsArrString},
            proposal: "${proposal.id}"
          }
        ) {
          voter
        }
      }
    `,
  }
  const response = await fetch(
    process.env.REACT_APP_SNAPSHOT_GRAPHQLAPI as string,
    {
      method: "POST",
      headers: headers,
      body: JSON.stringify(subgraphQuery),
    }
  )

  const { data } = await response.json()
  const votes = data.votes as {voter: string}[]
  const traitors = votes.map(vote => vote.voter)
  return traitors
}

const getBribees = async (args: GetBribeesArgs): Promise<string[]> => {
  const proposal = await getProposal(args.proposalId)
  const proposalTimestamp = await getBlockTimestamp(Number(proposal.snapshot))
  // check people that had delegated to briber before timestamp
  const delegations = await getDelegations({
    timestamp: proposalTimestamp,
    briber: args.briber,
  })
  // remove non-humans
  const poweredDelegators = await filterToPowered({ delegations })
  // then, check people that voted on the proposal, and filter them out
  const traitors = await getTraitors({delegators: poweredDelegators, proposal})
  // traitors hasn't actually been tested, any takers?
  const bribees = []
  for (const delegator of poweredDelegators) {
    if (traitors.find(traitor => traitor === delegator) === undefined)
      bribees.push(delegator)
  }
  return bribees
}

export default getBribees
