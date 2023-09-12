use anchor_lang::prelude::*;
use clockwork_sdk::state::{Thread, ThreadAccount};
use crate::state::*;

pub const BANK_ACCOUNT_SEED: &[u8] = b"bank_account";
pub const THREAD_AUTHORITY_SEED: &[u8] = b"authority";

#[derive(Accounts)]
#[instruction(thread_id : Vec<u8>)]
pub struct RemoveAccount<'info> {
    #[account(mut)]
    pub holder: Signer<'info>,

    #[account(
        mut,
        seeds = [BANK_ACCOUNT_SEED, thread_id.as_ref()],
        bump,
        close = holder
    )]
    pub bank_account: Account<'info, BankAccount>,

    #[account(mut, address = thread.pubkey(), constraint = thread.authority.eq(&thread_authority.key()))]
    pub thread: Account<'info, Thread>,

    #[account(seeds = [THREAD_AUTHORITY_SEED], bump)]
    pub thread_authority: SystemAccount<'info>,

    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, clockwork_sdk::ThreadProgram>,
}

pub fn handler(ctx: Context<RemoveAccount>, _thread_id: Vec<u8>) -> Result<()> {
    let clockwork_program = &ctx.accounts.clockwork_program;
    let holder = &ctx.accounts.holder;
    let thread = &ctx.accounts.thread;
    let thread_authority = &ctx.accounts.thread_authority;

    // Delete thread via CPI
    let bump = *ctx.bumps.get("thread_authority").unwrap();
    clockwork_sdk::cpi::thread_delete(CpiContext::new_with_signer(
        clockwork_program.to_account_info(),
        clockwork_sdk::cpi::ThreadDelete {
            authority: thread_authority.to_account_info(),
            close_to: holder.to_account_info(),
            thread: thread.to_account_info(),
        },
        &[&[THREAD_AUTHORITY_SEED, &[bump]]],
    ))?;
    Ok(())
}
