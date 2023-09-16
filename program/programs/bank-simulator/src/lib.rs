use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

pub use errors::*;
pub use instructions::*;
pub use state::*;

declare_id!("4QYK43nmFhCkckcSvr167fhYR2nYrVWKBMDdpWkD9PvT");

#[program]
pub mod bank_simulator {
    use super::*;

    pub fn initialize_account(
        ctx: Context<Initialize>,
        thread_id: Vec<u8>,
        holder_name: String,
        balance: f64,
    ) -> Result<()> {
        instructions::initialize_account::handler(ctx, thread_id, holder_name, balance)
    }

    pub fn add_interest(ctx: Context<AddInterest>, _thread_id: Vec<u8>) -> Result<()> {
        instructions::add_interest::handler(ctx, _thread_id)
    }

    pub fn withdraw(ctx: Context<WithdrawAmount>, _thread_id: Vec<u8>, amount: f64) -> Result<()> {
        instructions::withdraw::handler(ctx, _thread_id, amount)
    }

    pub fn deposit(ctx: Context<DepositAmount>, _thread_id: Vec<u8>, amount: f64) -> Result<()> {
        instructions::deposit::handler(ctx, _thread_id, amount)
    }

    pub fn remove_account(ctx: Context<RemoveAccount>, _thread_id: Vec<u8>) -> Result<()> {
        instructions::remove_account::handler(ctx, _thread_id)
    }

}
