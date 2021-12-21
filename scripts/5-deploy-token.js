import sdk from './1-initialize-sdk.js'

// In order to deploy the new contract we need our old friend the app module again.
const app = sdk.getAppModule('0xC4b7C1a1c87375A58eE41540f47b562607228a78');

(async () => {
  try {
    // Deploy a standard ERC-20 contract.
    const tokenModule = await app.deployTokenModule({
      // What's your token's name? Ex. "Ethereum"
      name: 'SportsDAO Governance Token',
      // What's your token's symbol? Ex. "ETH"
      symbol: 'SPORTS'
    })
    console.log(
      '✅ Successfully deployed token module, address:',
      tokenModule.address
    )
  } catch (error) {
    console.error('failed to deploy token module', error)
  }
})()
