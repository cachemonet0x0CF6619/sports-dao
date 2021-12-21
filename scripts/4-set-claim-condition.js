import sdk from './1-initialize-sdk.js'

const bundleDrop = sdk.getBundleDropModule(
  '0xA8e704242E776178A1Cf693a849a4BC454849076'
);

(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionFactory()
    // Specify conditions.
    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 5_000,
      maxQuantityPerTransaction: 1
    })

    await bundleDrop.setClaimCondition(0, claimConditionFactory)
    console.log('✅ Sucessfully set claim condition!')
  } catch (error) {
    console.error('Failed to set claim condition', error)
  }
})()
