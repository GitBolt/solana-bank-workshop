import * as anchor from '@project-serum/anchor'
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { ClockworkProvider } from "@clockwork-xyz/sdk";
import { anchorProgram } from '@/util/helper';

export const openBankAccount = async (
  wallet: anchor.Wallet,
  holderName: string,
  initialDeposit: number,
) => {
  const program = anchorProgram(wallet);

  const clockworkProvider = ClockworkProvider.fromAnchorProvider(
    program.provider as anchor.AnchorProvider
  );

  const threadId = "bank_account-" + new Date().getTime() / 1000;

  const [bank_account] = PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode("bank_account"), Buffer.from(threadId)],
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

  try {
    const sig = await program.methods.initializeAccount(Buffer.from(threadId), holderName, Number(initialDeposit.toFixed(2)))
      .accounts({
        bankAccount: bank_account,

        // Clockwork
        clockworkProgram: clockworkProvider.threadProgram.programId,
        thread: threadAddress,
        threadAuthority: threadAuthority,

        // Others
        holder: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      }).rpc()

    return { error: false, sig }

  } catch (e: any) {
    console.log(e)
    return { error: e.toString(), sig: null }
  }
}