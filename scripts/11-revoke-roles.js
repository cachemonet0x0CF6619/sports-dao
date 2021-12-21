import sdk from './1-initialize-sdk.js'

// This is the address to our ERC-20 token contract.
const tokenModule = sdk.getTokenModule(
  '0xb3f81b6909F9E44cCc7eB02F7E35f0d6DA8B7E09'
);

(async () => {
  try {
    // Log the current roles.
    console.log(
      '👀 Roles that exist right now:',
      await tokenModule.getAllRoleMembers()
    )

    // Revoke all the superpowers your wallet had over the ERC-20 contract.
    await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS)
    console.log(
      '🎉 Roles after revoking ourselves',
      await tokenModule.getAllRoleMembers()
    )
    console.log('✅ Successfully revoked our superpowers from the ERC-20 contract')
  } catch (error) {
    console.error('Failed to revoke ourselves from the DAO treasury', error)
  }
})()
