import * as anchor from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js';
import { ClockworkProvider } from "@clockwork-xyz/sdk";
import { anchorProgram } from '@/util/helper';

export const deleteAccount = async (
  wallet: anchor.Wallet,
  threadId: Uint8Array,
) => {

  const program = anchorProgram(wallet);

  const clockworkProvider = ClockworkProvider.fromAnchorProvider(
    program.provider as anchor.AnchorProvider
  );


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
    Buffer.from(threadId).toString()
  );

  try {
    const sig = await program.methods.removeAccount(Buffer.from(threadId))
      .accounts({
        holder: wallet.publicKey,
        bankAccount: bank_account,
        thread: threadAddress,
        threadAuthority: threadAuthority,
        clockworkProgram: clockworkProvider.threadProgram.programId,
      }).rpc()

    return { error: false, sig }

  } catch (e: any) {
    console.log(e)
    return { error: e.toString(), sig: null }
  }
}