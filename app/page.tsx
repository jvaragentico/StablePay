"use client";

import { useState } from "react";
import { Check, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, Copy, ExternalLink, FileText, Landmark, LockKeyhole, Network, ReceiptText, ShieldCheck, Sparkles, Wallet, X } from "lucide-react";
import { useAccount, useConnect, useDisconnect, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { keccak256, parseUnits, toBytes, type Address } from "viem";
import { erc20Abi, stablePayAbi } from "@/lib/abi";

type Phase = "idle" | "connected" | "approving" | "approved" | "sending" | "confirmed";
const contractAddress = process.env.NEXT_PUBLIC_STABLEPAY_CONTRACT as Address | undefined;
const usdcAddress = (process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x036CbD53842c5426634e7929541eC2318f3dCF7e") as Address;
const live = process.env.NEXT_PUBLIC_LIVE_TESTNET === "true" && !!contractAddress;
const short = (value?: string) => value ? `${value.slice(0, 6)}…${value.slice(-4)}` : "";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [txHash, setTxHash] = useState("0x7f34d15f42091c75685c0cbb77dcdab1bc775ec29393b450def19e81a4b2e910");
  const [copied, setCopied] = useState(false);
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const paid = phase === "confirmed";

  const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  async function connectOrStart() {
    if (!live) { setPhase("connected"); return; }
    if (!isConnected) await new Promise<void>((resolve) => { connect({ connector: connectors[0] }); setTimeout(resolve, 650); });
    if (chainId !== baseSepolia.id) await switchChainAsync({ chainId: baseSepolia.id });
    setPhase("connected");
  }
  async function pay() {
    if (!live) {
      setPhase("approving"); await pause(950); setPhase("approved"); await pause(650); setPhase("sending"); await pause(1150); setPhase("confirmed"); setReceiptOpen(true); return;
    }
    if (!contractAddress || !publicClient) return;
    setPhase("approving");
    const approval = await writeContractAsync({ address: usdcAddress, abi: erc20Abi, functionName: "approve", args: [contractAddress, parseUnits("125", 6)] });
    await publicClient.waitForTransactionReceipt({ hash: approval });
    setPhase("approved"); await pause(350); setPhase("sending");
    const payment = await writeContractAsync({ address: contractAddress, abi: stablePayAbi, functionName: "payInvoice", args: [keccak256(toBytes("0042"))] });
    await publicClient.waitForTransactionReceipt({ hash: payment });
    setTxHash(payment); setPhase("confirmed"); setReceiptOpen(true);
  }
  function reset() { setPhase("idle"); setReceiptOpen(false); if (live && isConnected) disconnect(); }
  async function copyHash() { await navigator.clipboard.writeText(txHash); setCopied(true); setTimeout(() => setCopied(false), 1400); }

  return <main>
    <nav><a className="brand" href="#"><span className="brandmark"><CircleDollarSign size={20}/></span><span>StablePay</span></a><div className="navright"><span className="network"><i/> Base Sepolia</span><span className="demo-pill"><Sparkles size={13}/> {live ? "Live testnet" : "Interactive demo"}</span></div></nav>

    <section className="hero">
      <div><div className="eyebrow">STABLECOIN PAYMENT INFRASTRUCTURE</div><h1>Invoices that settle<br/>at internet speed.</h1><p>Accept USDC payments globally. Onchain confirmation, automatic reconciliation, and receipts included.</p></div>
      <div className="hero-stat"><span>SETTLEMENT</span><strong>~2 sec</strong><small>on Base Sepolia</small></div>
    </section>

    <section className="workspace">
      <aside className="merchant">
        <div className="section-label"><span>MERCHANT CONSOLE</span><span className="online">LIVE</span></div>
        <div className="merchant-id"><div className="shop-logo">N</div><div><strong>Northstar Studio</strong><span>0x91b2…4eA8</span></div><ChevronRight size={18}/></div>
        <div className="metric-row"><div><span>TOTAL VOLUME</span><strong>$8,492.00</strong><small>+12.4% this month</small></div><div><span>PAID INVOICES</span><strong>38</strong><small>100% settled</small></div></div>
        <div className="invoice-title"><span>Recent invoices</span><button>+ New invoice</button></div>
        <div className={`invoice active ${paid ? "done" : ""}`}><div className="invoice-icon"><FileText size={18}/></div><div><strong>Invoice #0042</strong><span>Arc Labs · Today</span></div><div className="invoice-amount"><strong>$125.00</strong><span>{paid ? "PAID" : "PENDING"}</span></div></div>
        <div className="invoice"><div className="invoice-icon"><FileText size={18}/></div><div><strong>Invoice #0041</strong><span>Studio Eight · Sep 14</span></div><div className="invoice-amount"><strong>$840.00</strong><span className="paid-label">PAID</span></div></div>
        <div className="invoice"><div className="invoice-icon"><FileText size={18}/></div><div><strong>Invoice #0040</strong><span>Lightwell Co. · Sep 12</span></div><div className="invoice-amount"><strong>$320.00</strong><span className="paid-label">PAID</span></div></div>
        <div className="merchant-note"><ShieldCheck size={17}/><span>Payments settle directly to your wallet.<br/><b>No custody. No chargebacks.</b></span></div>
      </aside>

      <div className="checkout-wrap">
        <div className="checkout-top"><span>SECURE CHECKOUT</span><span><LockKeyhole size={13}/> ENCRYPTED</span></div>
        <div className="checkout-card">
          {paid ? <div className="success-view">
            <div className="success-ring"><Check size={34}/></div><span className="success-kicker">PAYMENT CONFIRMED</span><h2>$125.00 USDC</h2><p>Your payment to Northstar Studio is complete.</p>
            <div className="receipt-summary"><div><span>Invoice</span><b>#0042</b></div><div><span>Network</span><b>Base Sepolia</b></div><div><span>Transaction</span><b>{short(txHash)}</b></div></div>
            <button className="primary" onClick={() => setReceiptOpen(true)}><ReceiptText size={18}/> View receipt</button><button className="text-btn" onClick={reset}>Run demo again</button>
          </div> : <>
            <div className="bill-head"><div><span>PAYMENT REQUEST</span><h2>Invoice #0042</h2></div><div className="status"><Clock3 size={13}/> Awaiting payment</div></div>
            <div className="amount"><span>AMOUNT DUE</span><div><strong>$125.00</strong><b>USDC</b></div><small>1 USDC ≈ $1.00 USD</small></div>
            <div className="details"><div><span>Pay to</span><b>Northstar Studio</b></div><div><span>For</span><b>Brand identity package</b></div><div><span>Due</span><b>Today</b></div></div>
            {phase === "idle" ? <button className="primary" onClick={connectOrStart}><Wallet size={19}/> Connect wallet to pay</button> : <div className="connected-box"><div><span className="wallet-avatar"><Wallet size={16}/></span><span><small>CONNECTED WALLET</small><b>{live ? short(address) : "0x71C8…90F2"}</b></span><CheckCircle2 size={18}/></div><div className="balance"><span>USDC balance</span><b>2,480.50 USDC</b></div></div>}
            {phase !== "idle" && <button className="primary pay" disabled={["approving","sending"].includes(phase)} onClick={pay}>{phase === "approving" ? <><span className="spinner"/> Approving USDC…</> : phase === "approved" ? <><Check size={18}/> USDC approved</> : phase === "sending" ? <><span className="spinner"/> Confirming onchain…</> : <>Pay 125.00 USDC <ChevronRight size={19}/></>}</button>}
            <div className="fineprint"><ShieldCheck size={14}/> Payment processed by a verified smart contract</div>
          </>}
        </div>
      </div>
    </section>

    <section className="flow"><span className="flow-label">HOW IT WORKS</span>{[[Landmark,"Merchant"],[FileText,"Invoice"],[Wallet,"Wallet"],[CircleDollarSign,"USDC"],[Network,"Contract"],[CheckCircle2,"Confirmed"]].map(([Icon,label],i) => { const I=Icon as typeof Wallet; return <div className={`flow-step ${paid && i===5 ? "lit" : ""}`} key={label as string}><span><I size={18}/></span><b>{label as string}</b>{i<5&&<ChevronRight className="flow-arrow" size={16}/>}</div>})}</section>
    <footer><span>StablePay Commerce</span><span>Built on Base · Testnet only · No real funds</span><a href="https://github.com" target="_blank">View source <ExternalLink size={13}/></a></footer>

    {receiptOpen && <div className="modal" onMouseDown={() => setReceiptOpen(false)}><div className="receipt" onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={()=>setReceiptOpen(false)} aria-label="Close receipt"><X/></button><div className="receipt-brand"><span className="brandmark"><CircleDollarSign size={20}/></span><b>StablePay</b></div><div className="receipt-check"><Check size={26}/></div><h2>Payment receipt</h2><p>Transaction confirmed on Base Sepolia</p><div className="receipt-total"><span>PAID</span><strong>$125.00</strong><b>125.00 USDC</b></div><div className="receipt-lines"><div><span>Invoice</span><b>#0042</b></div><div><span>Merchant</span><b>Northstar Studio</b></div><div><span>Date</span><b>Sep 19, 2026</b></div><div><span>Status</span><b className="green">● Confirmed</b></div></div><button className="hash" onClick={copyHash}><span><small>TRANSACTION HASH</small><b>{short(txHash)}</b></span>{copied?<Check size={16}/>:<Copy size={16}/>}</button><div className="receipt-foot"><ShieldCheck size={14}/> Verified on Base Sepolia</div></div></div>}
  </main>;
}
