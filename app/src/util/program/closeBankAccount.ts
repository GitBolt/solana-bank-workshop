import * as anchor from '@project-serum/anchor'
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { anchorProgram } from '@/util/helper';



export const closeBankAccount = async (
  wallet: anchor.Wallet,
  threadId: Uint8Array,
) => {
  const program = anchorProgram(wallet);

  const [bank_account] = PublicKey.findProgramAddressSync(
    [Buffer.from("bank_account"), Buffer.from(Buffer.from(threadId).toString())],
    program.programId
  );

  try {
    const ix = await program.methods.closeAccount(Buffer.from(threadId))
      .accounts({
        bankAccount: bank_account,

        // Others
        holder: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      }).rpc()
      return {sig: ix, error: false}
  } catch (e: any) {
    console.log(e)
    return { error: e.toString(), sig: null }
  }
}