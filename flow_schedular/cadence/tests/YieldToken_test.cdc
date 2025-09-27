import Test

access(all) let account = Test.createAccount()

access(all) fun testContract() {
    let err = Test.deployContract(
        name: "YieldToken",
        path: "../contracts/YieldToken.cdc",
        arguments: [],
    )

    Test.expect(err, Test.beNil())
}