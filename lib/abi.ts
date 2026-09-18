export const erc20Abi = [{ type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] }] as const;
export const stablePayAbi = [{ type: "function", name: "payInvoice", stateMutability: "nonpayable", inputs: [{ name: "invoiceId", type: "bytes32" }], outputs: [] }] as const;
