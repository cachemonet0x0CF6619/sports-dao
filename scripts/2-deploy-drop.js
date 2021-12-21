
import { ethers } from 'ethers'
import sdk from './1-initialize-sdk.js'
import { readFileSync } from 'fs'

const app = sdk.getAppModule('0xC4b7C1a1c87375A58eE41540f47b562607228a78');

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      name: 'SportsDAO Membership',
      description: 'Own and manage sports team(s)',
      image: readFileSync('./assets/soccer-ball.png'),
      primarySaleRecipientAddress: ethers.constants.AddressZero
    })

    console.log(
      '✅ Successfully deployed bundleDrop module, address:',
      bundleDropModule.address
    )
    console.log(
      '✅ bundleDrop metadata:',
      await bundleDropModule.getMetadata()
    )
  } catch (error) {
    console.error('failed to deploy:', error)
  }
})()
