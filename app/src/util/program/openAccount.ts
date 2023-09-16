import * as anchor from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js';
import { ClockworkProvider } from "@clockwork-xyz/sdk";
import { anchorProgram } from '@/util/helper';
import { LOCALNET_RPC } from '../constants';

export const openBankAccount = async (
  wallet: anchor.Wallet,
  holderName: string,
  initialDeposit: number,
) => {

  const program = anchorProgram(wallet);

  const clockworkProvider = new ClockworkProvider(wallet, new Connection(LOCALNET_RPC))

  const threadId = "bank_account-" + new Date().getTime() / 1000;

  const [bank_account] = PublicKey.findProgramAddressSync(
    [Buffer.from("bank_account"), Buffer.from(threadId)],
    program.programId
  );

  const [threadAuthority] = PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode("authority")],
    program.programId
  );
  const [threadAddress] = clockworkProvider.getThreadPDA(
    threadAuthority,
    threadId
  );

  console.log(
    {
      bankAccount: bank_account.toBase58(),
      holder: wallet.publicKey.toBase58(),
      thread: threadAddress.toBase58(),
      threadAuthority: threadAuthority.toBase58(),
      clockworkProgram: clockworkProvider.threadProgram.programId.toBase58(),
    }
  )

  try {
    const ix = await program.methods.initializeAccount(Buffer.from(threadId), holderName, Number(initialDeposit.toFixed(2)))
      .accounts({
        bankAccount: bank_account,
        holder: wallet.publicKey,
        thread: threadAddress,
        threadAuthority: threadAuthority,
        clockworkProgram: clockworkProvider.threadProgram.programId,
      }).rpc()

    console.log("Ix: ", ix)
    return { error: false, sig: ix, threadId }

  } catch (e: any) {
    console.log(e)
    return { error: e.toString(), sig: null }
  }
}