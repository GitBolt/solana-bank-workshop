use anchor_lang::prelude::*;
use anchor_lang::solana_program::{self};
use anchor_lang::solana_program::{
    instruction::Instruction, native_token::LAMPORTS_PER_SOL, system_program,
};
use anchor_lang::InstructionData;
use clockwork_sdk::state::{Thread, ThreadAccount};

declare_id!("5mP16ymxF7Ac2hw85oAzCJUUnu9deUvYTyWhaQ4M7H39");

const ANNUAL_INTEREST: f64 = 2.5; // 2.5% interest return
const CRON_SCHEDULE: &str = "*/10 * * * * * *"; // 10s https://crontab.guru/
const AUTOMATION_FEE: f64 = 0.05;

pub const BANK_ACCOUNT_SEED: &[u8] = b"bank_account";
pub const THREAD_AUTHORITY_SEED: &[u8] = b"authority";

fn calculate_balance(created_at: i64, current_balance: f64) -> f64 {
    let now = Clock::get().unwrap().unix_timestamp;
    let elapsed_seconds = now - created_at;

    let interest_per_second = ANNUAL_INTEREST / 60.0 as f64; // number of seconds in a minute
    let interest_earned = current_balance as f64 * elapsed_seconds as f64 * interest_per_second;
    return current_balance + interest_earned;
}

#[program]
pub mod bank {
    use super::*;

    pub fn initialize_account(
        ctx: Context<Initialize>,
        thread_id: Vec<u8>,
        holder_name: String,
        balance: f64,
    ) -> Result<()> {
        // Accounts
        let system_program = &ctx.accounts.system_program;
        let clockwork_program = &ctx.accounts.clockwork_program;
        let holder = &ctx.accounts.holder;
        let thread = &ctx.accounts.thread;
        let thread_authority = &ctx.accounts.thread_authority;
        let bank_account = &mut ctx.accounts.bank_account;

        // Assigning init data
        bank_account.thread_id = thread_id.clone();
        bank_account.holder = *holder.key;
        bank_account.balance = balance;
        bank_account.holder_name = holder_name;
        bank_account.created_at = Clock::get().unwrap().unix_timestamp;

        // Clockwork Instruction
        let target_ix = Instruction {
            program_id: ID,
            accounts: crate::accounts::UpdateBalance {
                bank_account: bank_account.key(),
                thread: thread.key(),
                thread_authority: thread_authority.key(),
            }
            .to_account_metas(Some(true)),
            data: crate::instruction::UpdateBalance {
                _thread_id: thread_id.clone(),
                new_balance: calculate_balance(bank_account.created_at, bank_account.balance),
            }
            .data(),
        };

        // Clockwork Trigger
        let trigger = clockwork_sdk::state::Trigger::Cron {
            schedule: CRON_SCHEDULE.to_string(),
            skippable: true,
        };

        // Clockwork thread CPI
        let bump = *ctx.bumps.get("thread_authority").unwrap();
        clockwork_sdk::cpi::thread_create(
            CpiContext::new_with_signer(
                clockwork_program.to_account_info(),
                clockwork_sdk::cpi::ThreadCreate {
                    payer: holder.to_account_info(),
                    system_program: system_program.to_account_info(),
                    thread: thread.to_account_info(),
                    authority: thread_authority.to_account_info(),
                },
                &[&[THREAD_AUTHORITY_SEED, &[bump]]],
            ),
            AUTOMATION_FEE as u64 * LAMPORTS_PER_SOL, // https://docs.clockwork.xyz/developers/threads/fees
            thread_id,
            vec![target_ix.into()],
            trigger,
        )?;

        Ok(())
    }

    pub fn update_balance(
        ctx: Context<UpdateBalance>,
        _thread_id: Vec<u8>,
        new_balance: f64,
    ) -> Result<()> {
        let bank_account = &mut ctx.accounts.bank_account;
        bank_account.balance += new_balance;
        bank_account.updated_at = Clock::get().unwrap().unix_timestamp;
        msg!(
            "New Balance: {}, Updated_at: {}",
            bank_account.balance,
            bank_account.updated_at
        );
        Ok(())
    }

    pub fn withdraw(
        ctx: Context<UpdateBalance>,
        _thread_id: Vec<u8>,
    ) -> Result<()> {
        let bank_account = &mut ctx.accounts.bank_account;
        bank_account.balance = 0.0;
        bank_account.updated_at = Clock::get().unwrap().unix_timestamp;
        msg!(
            "New Balance: {}, Updated_at: {}",
            bank_account.balance,
            bank_account.updated_at
        );
        Ok(())
    }

    pub fn reset(ctx: Context<Reset>) -> Result<()> {
        // Accounts
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

    pub fn delete(_ctx: Context<DeleteAccount>, _thread_id: Vec<u8>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(thread_id: Vec<u8>)]
pub struct Initialize<'info> {
    /// The counter account to initialize.
    #[account(
        init,
        payer = holder,
        seeds = [BANK_ACCOUNT_SEED, thread_id.as_ref()],
        bump,
        space = 8 + std::mem::size_of::< BankAccount > (),
    )]
    pub bank_account: Account<'info, BankAccount>,

    /// The Clockwork thread program.
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, clockwork_sdk::ThreadProgram>,

    #[account(mut)]
    pub holder: Signer<'info>,

    /// The Solana system program.
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    /// Address to assign to the newly created thread.
    #[account(mut, address = Thread::pubkey(thread_authority.key(), thread_id))]
    pub thread: SystemAccount<'info>,

    /// The pda that will own and manage the thread.
    #[account(seeds = [THREAD_AUTHORITY_SEED], bump)]
    pub thread_authority: SystemAccount<'info>,
}

#[derive(Accounts)]
#[instruction(_thread_id: Vec<u8>)]
pub struct UpdateBalance<'info> {
    #[account(mut, seeds = [BANK_ACCOUNT_SEED, _thread_id.as_ref()], bump)]
    pub bank_account: Account<'info, BankAccount>,

    #[account(signer, constraint = thread.authority.eq(&thread_authority.key()))]
    pub thread: Account<'info, Thread>,

    #[account(seeds = [THREAD_AUTHORITY_SEED], bump)]
    pub thread_authority: SystemAccount<'info>,
}


#[derive(Accounts)]
#[instruction(_thread_id: Vec<u8>)]
pub struct UpdateBalanceManual<'info> {
    #[account(mut, seeds = [BANK_ACCOUNT_SEED, _thread_id.as_ref()], bump)]
    pub bank_account: Account<'info, BankAccount>,

    #[account(signer, constraint = thread.authority.eq(&thread_authority.key()))]
    pub thread: Account<'info, Thread>,

    #[account(seeds = [THREAD_AUTHORITY_SEED], bump)]
    pub thread_authority: SystemAccount<'info>,
}


#[derive(Accounts)]
#[instruction(_thread_id : Vec<u8>)]
pub struct DeleteAccount<'info> {
    #[account(mut)]
    pub holder: Signer<'info>,

    #[account(
        mut,
        close = holder,
        seeds = [BANK_ACCOUNT_SEED, _thread_id.as_ref()],
        bump=bank_account.bump
    )]
    pub bank_account: Account<'info, BankAccount>,

    // Misc Accounts
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
    #[account(address = solana_program::sysvar::rent::ID)]
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Reset<'info> {
    /// The signer.
    #[account(mut)]
    pub holder: Signer<'info>,

    /// The Clockwork thread program.
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, clockwork_sdk::ThreadProgram>,

    /// The thread to reset.
    #[account(mut, address = thread.pubkey(), constraint = thread.authority.eq(&thread_authority.key()))]
    pub thread: Account<'info, Thread>,

    /// The pda that owns and manages the thread.
    #[account(seeds = [THREAD_AUTHORITY_SEED], bump)]
    pub thread_authority: SystemAccount<'info>,

    /// Close the counter account
    #[account(
        mut,
        seeds = [BANK_ACCOUNT_SEED],
        bump,
        close = holder
    )]
    pub bank_account: Account<'info, BankAccount>,
}

#[account]
#[derive(Default)]
pub struct BankAccount {
    pub holder: Pubkey,
    pub holder_name: String,
    pub balance: f64,
    pub created_at: i64,
    pub updated_at: i64,
    pub thread_id: Vec<u8>,
    pub bump: u8,
}
