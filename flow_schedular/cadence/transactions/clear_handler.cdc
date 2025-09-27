// clear_handler.cdc
transaction() {
    prepare(signer: auth(UnpublishCapability, LoadValue) &Account) {
        // Unpublish the existing capability
        signer.capabilities.unpublish(/public/YieldTokenLoopTransactionHandler)
        
        // Remove the handler from storage
        let handler <- signer.storage.load<@AnyResource>(from: /storage/YieldTokenLoopTransactionHandler)
        destroy handler
        
        log("Cleared existing handler and capability")
    }
}