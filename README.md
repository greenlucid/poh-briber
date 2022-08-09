# poh-briber

Experimental project to reward voters that delegate to a briber delegate in PoH.

## Concept

- PoH users (bribees) delegate to a delegate (briber).
- The briber creates auctions for every vote.
- The winner of the auction can decide the option to vote.
- The briber votes for this option in Snapshot.
- After the vote is over, the briber calls a function in the contract to distribute rewards. In this function, the addresses of the bribees are passed as calldata.
  - A small amount goes to the briber in the concept as a dev fee, and especially, to compensate the human effort of creating the auctions and calling the functions. (5%)
  - A significant amount is devoted to contribute to the DAO. (45%)
  - The remainder is used to reward the bribees. (50%)

Delegating the vote is not enough to be accepted as a bribee, it is also needed to not have actually voted, to make sure the delegator does not override the vote.

The frontend will generate this list of valid bribees for reward distribution.

## Caveats

- Requires manual effort for the briber, who has to create the auctions and send the rewards.
- Crucial steps in the process are centralized.
  - Briber creates the auctions.
  - Briber votes the chosen option in Snapshot.
  - Briber distributes the rewards, choosing arbitrary addresses.

Thus, it requires a trusted briber, that ideally holds reputation within the community.

## Other details

The auction is a generalized second-price auction (GSP).

Harberger Taxes, while interesting, are not being used, because there are issues around keeping track of what bounty should be paid on each vote.

## Rationale

There are different ways of bribing.

One way is, per Snapshot vote, put a bounty for each option. The option that wins has its bounty distributed.
There are two alternatives from here:
1. Loser options get the pools refunded to the donors. But this is a bit cumbersome to implement, because you then need to identify the donations and remember the donor per donation.
2. Loser options also are distributed among those that voted for them.

This route makes voters that don't necessarily require the bribe, also get the reward. So, it's less efficient in the sense that the subset of voters that are only interested in the bribe could get a bigger reward.

Self selecting as a bribee is easy: just delegate to the briber delegate, and don't overwrite your vote. Also, implementing this as an auction is easier, and arguably more fun, so I went with it.

## Future improvements

You could reduce trust in this scheme and increase scalability by:

1. bribes are posted as a `bribeeCount` and `bribesRoot`, the root of a merkle tree with all the addresses
2. they are posted and they go through an optimistic period.
3. challengers take it to kleros

This way you can remove the briber fee, as it is no longer necessary to have this party handling trust. This also removes the scalability problem (this contract should break with >500 delegators).
