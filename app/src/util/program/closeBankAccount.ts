import * as anchor from '@project-serum/anchor'
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { anchorProgram } from '@/util/helper';
import { ClockworkProvider } from '@clockwork-xyz/sdk';



export const closeBankAccount = async (
  wallet: anchor.Wallet,
  threadId: string,
) => {
  const program = anchorProgram(wallet);
  const clockworkProvider = ClockworkProvider.fromAnchorProvider(program.provider as anchor.AnchorProvider);
  const [bank_account] = PublicKey.findProgramAddressSync(
    [Buffer.from("bank_account"), Buffer.from(Buffer.from(threadId).toString())],
    program.programId
  );
  const [threadAuthority] = PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode("authority")], // 👈 make sure it matches on the prog side
    program.programId
  );
  const [threadAddress, threadBump] = clockworkProvider.getThreadPDA(threadAuthority, threadId)

  try {
    const ix = await program.methods.removeInterest()
      .accounts({
        holder: wallet.publicKey,
        clockworkProgram: clockworkProvider.threadProgram.programId,
        bankAccount: bank_account,
        thread: threadAddress,
        threadAuthority: threadAuthority,
      }).rpc()
    return { sig: ix, error: false }
  } catch (e: any) {
    console.log(e)
    return { error: e.toString(), sig: null }
  }
}