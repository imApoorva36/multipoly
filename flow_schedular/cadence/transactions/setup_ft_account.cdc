import "FungibleToken"
import "YieldToken"

transaction () {

    prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {

        // Return early if the account already stores a YieldToken Vault
        if signer.storage.borrow<&YieldToken.Vault>(from: YieldToken.VaultStoragePath) != nil {
            return
        }

        let vault <- YieldToken.createEmptyVault(vaultType: Type<@YieldToken.Vault>())

        // Create a new YieldToken Vault and put it in storage
        signer.storage.save(<-vault, to: YieldToken.VaultStoragePath)

        // Create a public capability to the Vault that exposes the Vault interfaces
        let vaultCap = signer.capabilities.storage.issue<&YieldToken.Vault>(
            YieldToken.VaultStoragePath
        )
        signer.capabilities.publish(vaultCap, at: YieldToken.VaultPublicPath)
    }
}
