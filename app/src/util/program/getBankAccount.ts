import * as anchor from '@coral-xyz/anchor'
import { anchorProgram } from '@/util/helper';

export const getBankAccount = async (
  wallet: anchor.Wallet,
) => {
  const program = anchorProgram(wallet);

  try {
    // @ts-ignore
    const data = await program.account.bankAccount.all()
    console.log(data)
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