import { useWeb3 } from '@3rdweb/hooks'
import { ThirdwebSDK } from '@3rdweb/sdk'
import { ethers } from 'ethers'
import React, { useEffect, useState, useMemo } from 'react'

// We instatiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK('rinkeby')

// We can grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  '0xA8e704242E776178A1Cf693a849a4BC454849076'
)
// This is the address to our ERC-20 token contract.
const tokenModule = sdk.getTokenModule(
  '0xb3f81b6909F9E44cCc7eB02F7E35f0d6DA8B7E09'
)
// This is our governance contract.
const voteModule = sdk.getVoteModule(
  '0x9740D94a52Fcb70610afdd1EF4dF67124bdd48e1'
)

export default function Home() {
  const { connectWallet, address, error, provider } = useWeb3()

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined

  // State variable for us to know if user has our NFT.
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false)

  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false)
  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({})
  // The array holding all of our members addresses.
  const [memberAddresses, setMemberAddresses] = useState([])
  // Proposal state
  const [proposals, setProposals] = useState([])
  // Voting state
  const [isVoting, setIsVoting] = useState(false)
  // Voted state
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with
    // our deployed contract!
    sdk.setProviderOrSigner(signer)
  }, [signer]) 

  // Shorten wallet address, no need to show the whole thing.
  const shortenAddress = (str) => {
    return str.substring(0, 6) + '...' + str.substring(str.length - 4)
  }
  
  // Grab all the addresses NFT holders.
  useEffect(async () => {
    if (!hasClaimedNFT) return
  
    // Grab the users who hold the NFT with tokenId 0.
    try {
      const addresses = await bundleDropModule.getAllClaimerAddresses('0')
      setMemberAddresses(addresses)
    } catch (error) {
      console.error('failed to get member list', error)
    }
  }, [hasClaimedNFT])
  
  // Grab # of tokens each member holds.
  useEffect(async () => {
    if (!hasClaimedNFT) return
    try {
      const amounts = await tokenModule.getAllHolderBalances()
      setMemberTokenAmounts(amounts)
    } catch (error) {
      console.error('failed to get token amounts', error)
    }
  }, [hasClaimedNFT])

  // Now, we combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, it means they don't
          // hold any of our token.
          memberTokenAmounts[address] || 0,
          18
        )
      }
    })
  }, [memberAddresses, memberTokenAmounts])

  // Retreive all our existing proposals from the contract.
  useEffect(async () => {
    if (!hasClaimedNFT) return
    try {
      const proposals = await voteModule.getAll()
      setProposals(proposals)
      console.log('🌈 Proposals:', proposals)
    } catch (error) {
      console.error('failed to get proposals', error)
    }
  }, [hasClaimedNFT])
  
  // We also need to check if the user already voted.
  useEffect(async () => {
    // require member has claimed a token
    if (!hasClaimedNFT) return
    // require proposals exist
    if (!proposals.length) return
  
    // Check if the user has already voted on the proposal.
    try {
      const voted = await voteModule
        .hasVoted(proposals[0].proposalId, address)
  
      setHasVoted(voted)
    } catch (error) {
      console.error('failed to check if wallet has voted', error)
    }
  }, [hasClaimedNFT, proposals, address])

      // Establish membership status
  useEffect(async () => {
    if (!address) return

    try {
      // Check if use has membership token
      const balance = await bundleDropModule.balanceOf(address, '0')
      setHasClaimedNFT(balance.gt(0))
    } catch (error) {
      setHasClaimedNFT(false)
    }
  }, [address])

  // Display "Connect Wallet" unless we already have a connection.
  if (!address) {
    return (
      <div className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 lg:flex lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              (⚽️,⚽️) 
            </h2>
            <p className="mt-5 text-xl text-gray-400">
              Build the team you always said you could.
            </p>
          </div>
          <div className="mt-10 w-full max-w-xs">
            <button
              className=""
              onClick={() => connectWallet('injected')} >
              Connect
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error && error.name === 'UnsupportedChainIdError') {
    return (
      <div className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 lg:flex lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              (⚽️,⚽️) Please connect to Rinkeby
            </h2>
            <p className="mt-5 text-xl text-gray-400">
              (⚽️,⚽️) only works on the Rinkeby network, please switch networks in your connected wallet. 
            </p>
          </div>
          <div className="mt-10 w-full max-w-xs">
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 lg:flex lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              (⚽️,⚽️)ps!
            </h2>
            <p className="mt-5 text-xl text-gray-400">
              { error }
            </p>
          </div>
          <div className="mt-10 w-full max-w-xs">
          </div>
        </div>
      </div>
    )
  }

  if (hasClaimedNFT) {
    return (
      <>
      <div className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              (⚽️,⚽️)
            </h2>
            <p className="mt-5 text-xl text-gray-400">
              Welcome to the team, sport!
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:py-8 sm:px-6 lg:px-8">
        <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Roster</h3>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {memberList.map((member) => (
            <li key={member.address} className="py-4 flex">
              <img className="h-10 w-10 rounded-full" src={member.image?? ""} alt="" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{shortenAddress(member.address)}</p>
                <p className="text-sm text-gray-500">{member.tokenAmount}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="max-w-7xl mx-auto pb-8 px-4 sm:py-8 sm:px-6 lg:px-8">
        <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Active Proposals</h3>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            e.stopPropagation()

            // before we do async things, we want to disable the button to prevent double clicks
            setIsVoting(true)

            // lets get the votes from the form for the values
            const votes = proposals.map((proposal) => {
              const voteResult = {
                proposalId: proposal.proposalId,
                // abstain by default
                vote: 2
              }
              proposal.votes.forEach((vote) => {
                const elem = document.getElementById(
                  proposal.proposalId + '-' + vote.type
                )

                if (elem.checked) {
                  voteResult.vote = vote.type
                }
              })
              return voteResult
            })

            // first we need to make sure the user delegates their token to vote
            try {
              // we'll check if the wallet still needs to delegate their tokens before they can vote
              const delegation = await tokenModule.getDelegationOf(address)
              // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
              if (delegation === ethers.constants.AddressZero) {
                // if they haven't delegated their tokens yet, we'll have them delegate them before voting
                await tokenModule.delegateTo(address)
              }
              // then we need to vote on the proposals
              try {
                await Promise.all(
                  votes.map(async (vote) => {
                    // before voting we first need to check whether the proposal is open for voting
                    // we first need to get the latest state of the proposal
                    const proposal = await voteModule.get(vote.proposalId)
                    // then we check if the proposal is open for voting (state === 1 means it is open)
                    if (proposal.state === 1) {
                      // if it is open for voting, we'll vote on it
                      return voteModule.vote(vote.proposalId, vote.vote)
                    }
                    // if the proposal is not open for voting we just return nothing, letting us continue
                  })
                )
                try {
                  // if any of the propsals are ready to be executed we'll need to execute them
                  // a proposal is ready to be executed if it is in state 4
                  await Promise.all(
                    votes.map(async (vote) => {
                      // we'll first get the latest state of the proposal again, since we may have just voted before
                      const proposal = await voteModule.get(
                        vote.proposalId
                      )

                      // if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                      if (proposal.state === 4) {
                        return voteModule.execute(vote.proposalId)
                      }
                    })
                  )
                  // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                  setHasVoted(true)
                  // and log out a success message
                  console.log('successfully voted')
                } catch (err) {
                  console.error('failed to execute votes', err)
                }
              } catch (err) {
                console.error('failed to vote', err)
              }
            } catch (err) {
              console.error('failed to delegate tokens')
            } finally {
              // in *either* case we need to set the isVoting state to false to enable the button again
              setIsVoting(false)
            }
          }}
        >
          {proposals.map((proposal, index) => (
            <div key={proposal.proposalId} className="bg-white shadow sm:rounded-lg my-4">
              <div className="px-4 py-5 sm:p-6">
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>{proposal.description}</p>
                </div>
                <div className="flex mt-5">
                  {proposal.votes.map((vote) => (
                    <div key={vote.type} className="pr-4">
                      <input
                        type="radio"
                        id={proposal.proposalId + '-' + vote.type}
                        name={proposal.proposalId}
                        value={vote.type}
                        // default the "abstain" vote to chedked
                        defaultChecked={vote.type === 2}
                      />
                      <label
                        className="pl-2"
                        htmlFor={proposal.proposalId + '-' + vote.type}>
                        {vote.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-center pt-4">
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              disabled={isVoting || hasVoted}
              type="submit">
              {isVoting ? 'Voting...' : hasVoted ? 'You Already Voted' : 'Submit Votes'}
            </button>
          </div>
          <div className="flex justify-center text-center text-gray-500 pt-4">
            <small>
              This will trigger multiple transactions that you will need to
              sign.
            </small>
          </div>
        </form>
      </div>
      </>
    )
  }

  const mintNFT = async () => {
    setIsClaiming(true)
    // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
    try {
      await bundleDropModule.claim('0', 1)
      setIsClaiming(false)
      // Set claim state.
      setHasClaimedNFT(true)
      // Show user their fancy new NFT!
      console.log(
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
      )
    } catch (error) {
      console.error('failed to claim:', error)
      setIsClaiming(false)
    }
  }
  // wallet is conneted
  return (
    <div className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 lg:flex lg:justify-between">
        <div className="max-w-xl">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            (⚽️,⚽️) 
          </h2>
          <p className="mt-5 text-xl text-gray-400">
            Claim a jersey and join the club.
          </p>
        </div>
        <div className="mt-10 w-full max-w-xs">
          <button
            className=""
            disabled={isClaiming}
            onClick={() => mintNFT()}
          >
           {isClaiming ? 'Claiming...' : 'Join' }
          </button>
        </div>
      </div>
    </div>
  )
}
