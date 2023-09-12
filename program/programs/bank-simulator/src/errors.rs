use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Amount must be greater than zero")]
    AmountTooSmall,

    #[msg("Withdraw amount cannot be less than deposit")]
    AmountTooBig,
}
