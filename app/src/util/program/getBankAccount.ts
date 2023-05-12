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
            const account = data[0].account
            const details = {
                balance: account.balance,
                createdAt: account.createdAt,
                holderName: account.holderName,
                updatedAt: account.updatedAt
            }
            return { error: false, sig: details }

        }
        return { error: "Account not found", sig: '' }

    } catch (e: any) {
        console.log(e)
        return { error: e.toString(), sig: null }
    }
}