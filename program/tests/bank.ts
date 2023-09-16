import { ClockworkProvider } from "@clockwork-xyz/sdk";
import * as anchor from "@coral-xyz/anchor";
import { BankSimulator } from "../target/types/bank_simulator";

describe("bank", async () => {



  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.BankSimulator as anchor.Program<BankSimulator>;

  const clockworkProvider = ClockworkProvider.fromAnchorProvider(
    provider
  );


  const threadId = "bank_account-1";
  const holderName = "test10";
  const balance = 10.0;

  const [bank_account] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("bank_account"), Buffer.from(threadId)],
    program.programId
  );


  const [threadAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode("authority")],
    program.programId
  );
  const [threadAddress] = clockworkProvider.getThreadPDA(
    threadAuthority,
    threadId
  );

  console.log("Thread ID: ", threadId);
  console.log("Bank Account: ", bank_account.toBase58());
  console.log("Thread Authority: ", threadAuthority.toBase58());
  console.log("Thread Address: ", threadAddress.toBase58());
  console.log(
    "Clockwork Program: ",
    clockworkProvider.threadProgram.programId.toBase58()
  );

  it("Create Account", async () => {
    await program.methods
      .initializeAccount(
        Buffer.from(threadId),
        holderName,
        Number(balance.toFixed(2))
      )
      .accounts({
        holder: wallet.publicKey,
        bankAccount: bank_account,
        clockworkProgram: clockworkProvider.threadProgram.programId,
        thread: threadAddress,
        threadAuthority: threadAuthority,
      })
      .rpc();
  });

  // it("Deposit Amount", async () => {
  //   await program.methods
  //     .deposit(Buffer.from(threadId), balance)
  //     .accounts({
  //       bankAccount: bank_account,
  //       holder: wallet.publicKey,
  //     })
  //     .rpc();
  // });

  // it("Withdraw Amount", async () => {
  //   await program.methods
  //     .withdraw(Buffer.from(threadId), balance)
  //     .accounts({
  //       bankAccount: bank_account,
  //       holder: wallet.publicKey,
  //     })
  //     .rpc();
  // });

  // it("Delete Account", async () => {
  //   await program.methods
  //     .removeAccount(Buffer.from(threadId))
  //     .accounts({
  //       holder: wallet.publicKey,
  //       bankAccount: bank_account,
  //       thread: threadAddress,
  //       threadAuthority: threadAuthority,
  //       clockworkProgram: clockworkProvider.threadProgram.programId,
  //     })
  //     .rpc();
  // });
});
