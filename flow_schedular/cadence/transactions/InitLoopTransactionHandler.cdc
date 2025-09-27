import "YieldTokenLoopTransactionHandler"
import "FlowTransactionScheduler"
import "YieldToken"

transaction(targetAddress: Address) {
    prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, SaveValue, PublishCapability) &Account) {
        // Save a handler resource to storage if not already present
        if signer.storage.borrow<&AnyResource>(from: /storage/YieldTokenLoopTransactionHandler) == nil {
            // Create a capability to the minter (assuming the signer has the minter)
            let minterCap = signer.capabilities.storage
                .issue<&YieldToken.Minter>(YieldToken.MinterStoragePath)
            
            let handler <- YieldTokenLoopTransactionHandler.createHandler(
                targetAddress: targetAddress,
                tokenMinter: minterCap
            )
            signer.storage.save(<-handler, to: /storage/YieldTokenLoopTransactionHandler)
        }

        // Validation/example that we can create an issue a handler capability with correct entitlement for FlowTransactionScheduler
        let _ = signer.capabilities.storage
            .issue<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>(/storage/YieldTokenLoopTransactionHandler)
   
        // Issue a non-entitled public capability for the handler that is publicly accessible
        let publicCap = signer.capabilities.storage
            .issue<&{FlowTransactionScheduler.TransactionHandler}>(/storage/YieldTokenLoopTransactionHandler)
        // publish the capability
        signer.capabilities.publish(publicCap, at: /public/YieldTokenLoopTransactionHandler)
    }
}