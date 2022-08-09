# poh-briber

## Guide

### Some notes

To be elegible for the bribes, you need to delegate to the briber! (me).

- [Enter this site](https://snapshot.org/#/delegate)
- Paste my address: `0x89c4ACb8B5b5B8E5B2121934B9e143569a914C80`
- If you only want to delegate to me for PoH things, make sure to "Limit delegation to a single space" and put `poh.eth` in there.

You must also NOT actively vote in proposals. If you vote in a proposal, you are no longer elegible for the bribe of that proposal. Only do so if you care more about the result than the bribe.

### The Frontend

If you actually want to bribe and buy the votes, you need to use the frontend.

In the Home page, you can see the current auctions. They're ordered from most recent to oldest.

Click on an auction to read the details.

### Auction Details

When accessing an auction, you can see some extra info. You can see the voting power of the briber delegate. Click on the "proposal" to go to Snapshot and see things properly.

From the details, you can bid on the option. This is a Second Price Auction, so the difference between the second highest bid and the highest will be refunded to the winner.

### Setting an Option

Once you're the winner, you can set an option as long as you do before deadline. It's very crude right now, I'll make it prettier if I have time. The "first option" is number 0! Let's put an example, imagine there are these options:

- Advance to Phase 3
- Make no Changes

Here, "Advance to Phase 3" is the option 0, and "Make no Changes" is the option 1.

### Distributing Rewards

I take care of this, but, if you're curious:

- rewards are only distributed after the proposal ends. This is to make sure the bribees are not overriding the delegation with their own votes.
- Rewards are distributed in the following way:
  - 5% goes to briber (me) in management fees (also, development). I have to manually create and distribute the auctions every time.
  - 45% goes to burn UBI.
  - 50% is distributed among the bribees.
