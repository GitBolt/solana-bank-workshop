use anchor_lang::prelude::*;
use anchor_lang::solana_program::{self, system_program, sysvar::rent::Rent};

const INTEREST_RATE: f64 = 2.5; // Defining annual interest raet

declare_id!("611igfTen8mrQpsKDeipSu5G885VXK1xmotvrAEj6r5V");

#[program]
pub mod program {
    use std::string;

    use super::*;

    pub fn initialize_account(
        ctx: Context<InitializeAccount>,
        _id: u64,
        _amount: u64,
        _holderName: String,
    ) -> Result<()> {
        let bank_account = &mut ctx.accounts.bank_account;
        let integer_id = _id.parse::<u64>().unwrap();
        let string_id = integer_id.to_string();

        require_eq!(string_id, _id);

        bank_account.id = integer_id;
        bank_account.holder_name = _holderName;
        bank_account.balance = _amount;
        bank_account.bump = *ctx.bumps.get("bank_account").unwrap();

        Ok(())
    }

    pub fn update_account(
        ctx: Context<UpdateAccount>,
        _id: String,
        _balance: u64,
        _holderName: String,
    ) -> Result<()> {
        let bank_account: &mut Account<BankAccount> = &mut ctx.accounts.bank_account;
        bank_account.holder_name = _holderName;
        bank_account.balance = _balance;
        Ok(())
    }

    pub fn delete_expense(ctx: Context<DeleteAccount>, _id: String) -> Result<()> {
        Ok(())
    }

}

#[derive(Accounts)]
#[instruction(_id : String)]
pub struct InitializeAccount<'info> {
    #[account(mut,)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 
            + 8 // Id
            + 8 // Balance
            + 8 // Created At
            + (4 + 12) // Holder Name
            + 8 // Interest Rate
            + 1, // bump
        seeds = [b"bank".as_ref(),authority.key().as_ref(),_id.as_ref()], 
        bump
    )]
    pub bank_account: Account<'info, BankAccount>,

    // Misc Accounts
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
    #[account(address = solana_program::sysvar::rent::ID)]
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(_id : String)]
pub struct UpdateAccount<'info> {
    #[account(mut,)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"bank".as_ref(),authority.key().as_ref(),_id.as_ref()], 
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
#[instruction(_id : String)]
pub struct DeleteAccount<'info> {
    #[account(mut,)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        close = authority,
        seeds = [b"bank".as_ref(),authority.key().as_ref(),_id.as_ref()], 
        bump=use anchor_lang::prelude::*;
use anchor_lang::solana_program::{self, system_program, sysvar::rent::Rent};

const INTEREST_RATE = 2.5 // Defining annual interest raet

declare_id!("611igfTen8mrQpsKDeipSu5G885VXK1xmotvrAEj6r5V");

#[program]
pub mod program {
    use std::string;

    use super::*;

    pub fn initialize_account(
        ctx: Context<InitializeAccount>,
        _id: u43,
        _amount: u64,
        _holderName: String,
    ) -> Result<()> {
        let bank_account = &mut ctx.accounts.bank_account;
        let integer_id = _id.parse::<u64>().unwrap();
        let string_id = integer_id.to_string();

        require_eq!(string_id, _id);

        bank_account.id = integer_id;
        bank_account.holderName = _holderName;
        bank_account.balance = _amount;
        bank_account.bump = *ctx.bumps.get("bank_account").unwrap();

        Ok(())
    }

    pub fn update_account(
        ctx: Context<ModifyExpense>,
        _id: String,
        _balance: u64,
        _holderName: String,
    ) -> Result<()> {
        let bank_account = &mut ctx.accounts.bank_account;
        bank_account.holderName = _holderName;
        bank_account.balance = _balance;
        Ok(())
    }

    pub fn delete_expense(ctx: Context<DeleteAccount>, _id: String) -> Result<()> {
        Ok(())
    }

}

#[derive(Accounts)]
#[instruction(_id : String)]
pub struct InitializeAccount<'info> {
    #[account(mut,)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 
            + 8 // Id
            + 8 // Balance
            + 8 // Created At
            + (4 + 12) // Holder Name
            + 8 // Interest Rate
            + 1, // bump
        seeds = [b"bank".as_ref(),authority.key().as_ref(),_id.as_ref()], 
        bump
    )]
    pub bank_account: Account<'info, BankAccount>,

    // Misc Accounts
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
    #[account(address = solana_program::sysvar::rent::ID)]
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(_id : String)]
pub struct UpdateAccount<'info> {
    #[account(mut,)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"bank".as_ref(),authority.key().as_ref(),_id.as_ref()], 
        bump=expense_account.bump
    )]
    pub bank_account: Account<'info, BankAccount>,

    // Misc Accounts
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
    #[account(address = solana_program::sysvar::rent::ID)]
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(_id : String)]
pub struct DeleteAccount<'info> {
    #[account(mut,)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        close = authority,
        seeds = [b"bank".as_ref(),authority.key().as_ref(),_id.as_ref()], 
        bump=bank-account.bump
    )]
    pub bank_account: Account<'info, BankAccount>,

    // Misc Accounts
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
    #[account(address = solana_program::sysvar::rent::ID)]
    pub rent: Sysvar<'info, Rent>,
}

#[account]
#[derive(Default)]
pub struct BankAccount {
    pub id: u64,
    pub balance: u64,
    pub created_at: u64,
    pub holder_name: String,
    pub bump: u8,
}
.bump
    )]
    pub bank_account: Account<'info, BankAccount>,

    // Misc Accounts
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
    #[account(address = solana_program::sysvar::rent::ID)]
    pub rent: Sysvar<'info, Rent>,
}

#[account]
#[derive(Default)]
pub struct BankAccount {
    pub id: u64,
    pub balance: u64,
    pub created_at: u64,
    pub holder_name: String,
    pub bump: u8,
}
