use anchor_lang::prelude::*;
use clockwork_sdk::state::Thread;
use crate::state::*;

pub const BANK_ACCOUNT_SEED: &[u8] = b"bank_account";
pub const THREAD_AUTHORITY_SEED: &[u8] = b"authority";

// Calculating interest per minute instead of anually for faster results
const MINUTE_INTEREST: f64 = 0.05; // 5% interest return

#[derive(Accounts)]
#[instruction(thread_id: Vec<u8>)]
pub struct AddInterest<'info> {
    #[account(mut, seeds = [BANK_ACCOUNT_SEED, thread_id.as_ref()], bump)]
    pub bank_account: Account<'info, BankAccount>,

    #[account(signer, constraint = thread.authority.eq(&thread_authority.key()))]
    pub thread: Account<'info, Thread>,

    #[account(seeds = [THREAD_AUTHORITY_SEED], bump)]
    pub thread_authority: SystemAccount<'info>,
}

pub fn handler(ctx: Context<AddInterest>, _thread_id: Vec<u8>) -> Result<()> {
    let now = Clock::get().unwrap().unix_timestamp;

    let bank_account = &mut ctx.accounts.bank_account;
    bank_account.updated_at = now;

    let elapsed_time = (now - bank_account.created_at) as f64;
    let minutes = elapsed_time / 60.0;
    let accumulated_value = bank_account.balance * (1.0 + (MINUTE_INTEREST)).powf(minutes);

    bank_account.balance = accumulated_value;

    msg!(
        "New Balance: {}, Minutes Elasped when Called: {}",
        accumulated_value,
        minutes,
    );
    Ok(())
}
