use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct BankAccount {
    pub holder: Pubkey,
    pub holder_name: String,
    pub balance: f64,
    pub thread_id: Vec<u8>,
    pub created_at: i64,
    pub updated_at: i64,
}
