import * as anchor from '@project-serum/anchor'
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { ClockworkProvider } from "@clockwork-xyz/sdk";
import { anchorProgram } from '@/util/helper';

export const getBankAccount = async (
  wallet: anchor.Wallet,
  // holderName: string,
  // initialDeposit: number,
) => {
  const program = anchorProgram(wallet);

  try {
    // @ts-ignore
    const data = await program.account.bankAccount.all([
      {
        memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() }
      }
    ])
    if (data && data.length) {
      const accounts = data.map((item: any) => {
        return (
          {
            balance: item.account.balance,
            createdAt: item.account.createdAt.toNumber(),
            holderName: item.account.holderName,
            updatedAt: item.account.updatedAt.toNumber(),
            threadId: item.account.threadId ? Buffer.from(item.account.threadId).toString() : '',
            pubKey: item.publicKey.toBase58(),
          }
        )
      })
      return { error: false, sig: accounts }

    }
    return { error: "Account not found", sig: '' }

  } catch (e: any) {
    console.log(e)
    return { error: e.toString(), sig: null }
  }
}