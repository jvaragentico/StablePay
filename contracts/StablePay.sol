// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract StablePay is Ownable {
    using SafeERC20 for IERC20;
    enum Status { None, Open, Paid, Cancelled }
    struct Invoice { address merchant; address payer; uint256 amount; Status status; string reference; }
    IERC20 public immutable paymentToken;
    mapping(bytes32 => Invoice) public invoices;

    event InvoiceCreated(bytes32 indexed invoiceId, address indexed merchant, address payer, uint256 amount, string reference);
    event InvoicePaid(bytes32 indexed invoiceId, address indexed payer, address indexed merchant, uint256 amount);
    event InvoiceCancelled(bytes32 indexed invoiceId);

    constructor(address token, address initialOwner) Ownable(initialOwner) { require(token != address(0), "token required"); paymentToken = IERC20(token); }

    function createInvoice(bytes32 invoiceId, address payer, uint256 amount, string calldata reference) external {
        require(invoiceId != bytes32(0) && amount > 0, "invalid invoice");
        require(invoices[invoiceId].status == Status.None, "invoice exists");
        invoices[invoiceId] = Invoice(msg.sender, payer, amount, Status.Open, reference);
        emit InvoiceCreated(invoiceId, msg.sender, payer, amount, reference);
    }

    function payInvoice(bytes32 invoiceId) external {
        Invoice storage invoice = invoices[invoiceId];
        require(invoice.status == Status.Open, "invoice unavailable");
        require(invoice.payer == address(0) || invoice.payer == msg.sender, "wrong payer");
        invoice.status = Status.Paid;
        paymentToken.safeTransferFrom(msg.sender, invoice.merchant, invoice.amount);
        emit InvoicePaid(invoiceId, msg.sender, invoice.merchant, invoice.amount);
    }

    function cancelInvoice(bytes32 invoiceId) external {
        Invoice storage invoice = invoices[invoiceId];
        require(invoice.merchant == msg.sender, "not merchant");
        require(invoice.status == Status.Open, "invoice unavailable");
        invoice.status = Status.Cancelled;
        emit InvoiceCancelled(invoiceId);
    }
}
