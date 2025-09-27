import "FlowTransactionScheduler"
import "FlowTransactionSchedulerUtils"
import "FlowToken"
import "FungibleToken"
import "YieldToken"

access(all) contract YieldTokenLoopTransactionHandler {

    /// Struct to hold loop configuration data
    access(all) struct LoopConfig {
        access(all) let delay: UFix64
        access(all) let schedulerManagerCap: Capability<auth(FlowTransactionSchedulerUtils.Owner) &{FlowTransactionSchedulerUtils.Manager}>
        access(all) let feeProviderCap: Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault>
        access(all) let priority: FlowTransactionScheduler.Priority
        access(all) let executionEffort: UInt64

        init(
            delay: UFix64,
            schedulerManagerCap: Capability<auth(FlowTransactionSchedulerUtils.Owner) &{FlowTransactionSchedulerUtils.Manager}>,
            feeProviderCap: Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault>,
            priority: FlowTransactionScheduler.Priority,
            executionEffort: UInt64
        ) {
            self.delay = delay
            self.schedulerManagerCap = schedulerManagerCap
            self.feeProviderCap = feeProviderCap
            self.priority = priority
            self.executionEffort = executionEffort
        }
    }

    /// Handler resource that implements the Scheduled Transaction interface
    access(all) resource Handler: FlowTransactionScheduler.TransactionHandler {
        access(all) let targetAddress: Address
        access(all) let tokenMinter: Capability<&YieldToken.Minter>

        init(targetAddress: Address, tokenMinter: Capability<&YieldToken.Minter>) {
            self.targetAddress = targetAddress
            self.tokenMinter = tokenMinter
        }

        access(FlowTransactionScheduler.Execute) fun executeTransaction(id: UInt64, data: AnyStruct?) {
            // Get the current balance of the target account
            let currentBalance = getAccount(self.targetAddress)
                .capabilities.borrow<&{FungibleToken.Balance}>(YieldToken.VaultPublicPath)
                ?.balance
                ?? panic("Could not read balance from account ".concat(self.targetAddress.toString()))
            
            // Calculate 1% of the current balance
            let additionalAmount = currentBalance * 0.01
            
            // Only mint if the additional amount is greater than 0
            if additionalAmount > 0.0 {
                // Borrow the minter and mint tokens
                let minter = self.tokenMinter.borrow()
                    ?? panic("Cannot borrow token minter capability")
                let mintedVault <- minter.mintTokens(amount: additionalAmount)
                
                // Get the receiver and deposit tokens
                let tokenReceiver = getAccount(self.targetAddress).capabilities
                    .borrow<&{FungibleToken.Receiver}>(YieldToken.VaultPublicPath)
                    ?? panic("Could not borrow receiver reference")
                tokenReceiver.deposit(from: <-mintedVault)
                
                log("Minted and deposited additional ".concat(additionalAmount.toString()).concat(" YieldTokens to account ").concat(self.targetAddress.toString()))
            }

            // Extract loop configuration from transaction data
            let loopConfig = data as! LoopConfig? ?? panic("LoopConfig data is required")

            let future = getCurrentBlock().timestamp + loopConfig.delay

            let estimate = FlowTransactionScheduler.estimate(
                data: data,
                timestamp: future,
                priority: loopConfig.priority,
                executionEffort: loopConfig.executionEffort
            )

            assert(
                estimate.timestamp != nil || loopConfig.priority == FlowTransactionScheduler.Priority.Low,
                message: estimate.error ?? "estimation failed"
            )

            // Borrow fee provider and withdraw fees
            let feeVault = loopConfig.feeProviderCap.borrow()
                ?? panic("Cannot borrow fee provider capability")
            let fees <- feeVault.withdraw(amount: estimate.flowFee ?? 0.0)

            // Schedule next transaction through the manager
            let schedulerManager = loopConfig.schedulerManagerCap.borrow()
                ?? panic("Cannot borrow scheduler manager capability")
            
            // Use scheduleByHandler since this handler has already been used
            let transactionId = schedulerManager.scheduleByHandler(
                handlerTypeIdentifier: self.getType().identifier,
                handlerUUID: self.uuid,
                data: data,
                timestamp: future,
                priority: loopConfig.priority,
                executionEffort: loopConfig.executionEffort,
                fees: <-fees as! @FlowToken.Vault
            )

            log("Loop transaction id: ".concat(transactionId.toString()).concat(" scheduled at ").concat(future.toString()))
        }
    }

    /// Factory for the handler resource
    access(all) fun createHandler(targetAddress: Address, tokenMinter: Capability<&YieldToken.Minter>): @Handler {
        return <- create Handler(targetAddress: targetAddress, tokenMinter: tokenMinter)
    }

    /// Helper function to create a loop configuration with just delay parameter
    access(all) fun createLoopConfig(
        delay: UFix64,
        schedulerManagerCap: Capability<auth(FlowTransactionSchedulerUtils.Owner) &{FlowTransactionSchedulerUtils.Manager}>,
        feeProviderCap: Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault>
    ): LoopConfig {
        return LoopConfig(
            delay: delay,
            schedulerManagerCap: schedulerManagerCap,
            feeProviderCap: feeProviderCap,
            priority: FlowTransactionScheduler.Priority.Medium,  // Fixed priority
            executionEffort: 1000  // Fixed execution effort
        )
    }
}