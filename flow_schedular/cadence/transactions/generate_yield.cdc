import "FungibleToken"
import "YieldToken"

transaction(targetAddress: Address) {
    
    /// Reference to the YieldToken Minter Resource object
    let tokenMinter: &YieldToken.Minter

    /// Reference to the Fungible Token Receiver of the recipient
    let tokenReceiver: &{FungibleToken.Receiver}
    
    prepare(signer: auth(BorrowValue) &Account) {
        // Borrow a reference to the minter object
        self.tokenMinter = signer.storage.borrow<&YieldToken.Minter>(from: YieldToken.MinterStoragePath)
            ?? panic("Cannot mint: Signer does not store the YieldToken Minter in their account!")

        // Get the recipient's vault reference
        self.tokenReceiver = getAccount(targetAddress).capabilities.borrow<&{FungibleToken.Receiver}>(YieldToken.VaultPublicPath)
            ?? panic("Could not borrow a Receiver reference to the FungibleToken Vault in account "
                .concat(targetAddress.toString()).concat(" at path ").concat(YieldToken.VaultPublicPath.toString())
                .concat(". Make sure you are sending to an address that has ")
                .concat("a FungibleToken Vault set up properly at the specified path."))
    }
    
    execute {
        // Get the current balance of the target account
        let currentBalance = getAccount(targetAddress)
            .capabilities.borrow<&{FungibleToken.Balance}>(YieldToken.VaultPublicPath)
            ?.balance
            ?? panic("Could not read balance from account ".concat(targetAddress.toString()))
        
        // Calculate 1% of the current balance
        let additionalAmount = currentBalance * 0.01
        
        // Only mint if the additional amount is greater than 0
        if additionalAmount > 0.0 {
            // Create mint tokens
            let mintedVault <- self.tokenMinter.mintTokens(amount: additionalAmount)
            
            // Deposit them to the receiver
            self.tokenReceiver.deposit(from: <-mintedVault)
            
            log("Minted and deposited additional ".concat(additionalAmount.toString()).concat(" YieldTokens to account ").concat(targetAddress.toString()))
        } else {
            log("No tokens to mint - current balance is 0")
        }
    }
}