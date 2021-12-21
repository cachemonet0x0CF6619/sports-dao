import sdk from './1-initialize-sdk.js'
import { readFileSync } from 'fs'

const bundleDrop = sdk.getBundleDropModule(
  '0xA8e704242E776178A1Cf693a849a4BC454849076'
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: 'Inaugural Season',
        description: 'This NFT provides membership to SportsDAO!',
        image: readFileSync('scripts/assets/season-zero.png')
      }
    ])
    console.log('✅ Successfully created a new NFT in the drop!')
  } catch (error) {
    console.error('failed to create the new NFT', error)
  }
})()
