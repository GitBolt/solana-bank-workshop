# Bank Simulator with Interest

## 🎬 Recorded Sessions

| Link        | Instructor | Event |
| ----------- | ---------- | ----- |
| Coming Soon | -          | -     |

## ☄️ Open in Solana Playground IDE

| Program         | Link                                                                                                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bank Simulator | [ ![program](https://ik.imagekit.io/mkpjlhtny/solpg_button_zWM8WlPKs.svg?ik-sdk-version=javascript-1.4.3&updatedAt=1662621556513)](https://beta.solpg.io/645fc8f0d6ebe745da2043a6) |


## 📗 Learn

In this workshop, we'll learn about on-chain automation using Clockwork by simulating interest returns in bank account. In real life, banks offer interest rates of around 2.5% - 7% annually. In our program however, we'll be implementing 5% returns per minute, just to display the balance change considerably enough, otherwise, we would need to wait for a long time to notice a significant change in the balance with the real-world interest rate.

### How to Build & Run

1. You would need to deploy the program on Solana blockchain first. You can use SolPg to get started quickly or clone this and work locally:
 - SOLPg
   - Click on the [Solana Playground](https://beta.solpg.io/645fc8f0d6ebe745da2043a6) link and deploy it
  - Working Locally
    - Install [Anchor](https://www.anchor-lang.com/), [Rust](https://www.rust-lang.org/tools/install) and [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) and [Clockwork CLI](https://docs.clockwork.xyz/welcome/installation) and clone this repository
    - Run `clockwork localnet`
    - Then, open a new terminal instance and head over to `program/` directory using `cd program/` command.
    - Enter `anchor build` and `yarn install` in the same directory.
    - Then, enter `anchor deploy`, you'll get a program Id at the end, copy it and paste it in [declare_id macro](/program/programs/bank-simulator/src/lib.rs) and in [Anchor.toml localnet section](/program/Anchor.toml)
    - Finally, enter `anchor test --skip-local-validator` to build everything and run tests.

> Note that you may have some issues using latest version of Solana CLI. It is recommend that you install Solana CLI version 1.14.18
If you see blockhash keep expiring when you run `anchor deploy` or when running `anchor test`, then just stop your clockwork validator and re-start it. That will solve the issue.
  

2. To launch the frontend, head over to `/app` directory and enter: `yarn install && yarn dev`


### Automation

We'll be using [Clockwork](https://www.clockwork.xyz/) for running a cron job that updates our balance with interest returns every 10 seconds. In the real world, interest returns are deposited on a periodic basis, the interval however is large, like quarterly or yearly. We'll be depositing every 10 seconds to quickly observe changes and understand better.

Clockwork has a thing called [Threads](https://docs.clockwork.xyz/developers/threads), which trigger certain instruction based on a certain trigger condition. For our case, the trigger condition is a Cronjob every 10 seconds.

One important thing about our dApp is that our interest returns will stop after about 5 minutes, the reason for that is that Clockwork requires some amount of fee to run each automation transaction. In our program, we're defining a very small fee. We can increase it to enable our automation to work for a longer time!

### Anchor Program

Let's go through the code and understand how our program works.

1. Constants

- 1.1 Interest, Cron Schedule, Automation Fee
- 1.2 Seeds

1. Initializing Account

- 2.1 Defining `InitilizeAccount` context
- 2.2 Defining Clockwork Target Instruction and Trigger
- 2.3 Making a CPI to Clockwork program
  
3. Updating Balance
- 3.1 Depositing Amount
- 3.2 Withdrawing Amount
- 3.3 Adding Interest

----
#### 1.1 Interest, Cron Schedule, Automation Fee

First of all, open up [program/programs/program/src/lib.rs](program/programs/program/src/lib.rs)

In the first few lines, we're defining some really important constants. Let's have a look.

```rust
// Line 9

const MINUTE_INTEREST: f64 = 0.05; // 5% interest return
const CRON_SCHEDULE: &str = "*/10 * * * * * *"; // 10s https://crontab.guru/
const AUTOMATION_FEE: f64 = 0.05; // https://docs.clockwork.xyz/developers/threads/fees


```
We first have `CRON_SCHEDULE` constant defined. This format may look confusing, so in order to create your own schedule time, you can use [CronTab Tool](https://crontab.guru/)

Then, we have our `AUTOMATION_FEE`, this is the fee we can deposit to our Clockwork thread for it to run automations. According to [Clockwork Docs](https://docs.clockwork.xyz/developers/threads/fees), the automation base fee is **0.000001 SOL / executed instruction**

#### 1.2 Seeds

Have a look into these:

```rs
// Line 13

pub const BANK_ACCOUNT_SEED: &[u8] = b"bank_account";
pub const THREAD_AUTHORITY_SEED: &[u8] = b"authority";
```
We have some seeds defined, we'll be using these seeds multiple times in our program, so defining them as separate constants is a better practice for readability and easy access if we wanted to change it.

----

#### 2.1 Defining InitilizeAccount context
Scroll down to line 146 (in [program/programs/program/src/lib.rs](program/programs/program/src/lib.rs)) and see this:
```rs
#[derive(Accounts)]
#[instruction(thread_id: Vec<u8>)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub holder: Signer<'info>,

    #[account(
        init,
        payer = holder,
        seeds = [BANK_ACCOUNT_SEED, thread_id.as_ref()],
        bump,
        space = 8 + std::mem::size_of::< BankAccount > (),
    )]
    pub bank_account: Account<'info, BankAccount>,

    #[account(mut, address = Thread::pubkey(thread_authority.key(), thread_id))]
    pub thread: SystemAccount<'info>,

    #[account(seeds = [THREAD_AUTHORITY_SEED], bump)]
    pub thread_authority: SystemAccount<'info>,

    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, clockwork_sdk::ThreadProgram>,

    pub system_program: Program<'info, System>,
}
```

We have first defined our `bank_account`, which is derived using our bank account seed constant and a thread id.
The thread id here is the automation thread by Clockwork whose Id we're passing.

Along with System program, we also need to pass Clockwork program for this to work. Hence, we're using `clockwork_program` account as well.

At the bottom, we have our `thread` account and the thread account's `thread_authority`, these are also mandatory accounts for our threads to work.

#### 2.2 Defining Clockwork Target Instruction and Trigger
This is one of the most important parts of our program. Have a deep look into our `initialize_account` instruction starting at line 20:

```rs
pub fn initialize_account(
    ctx: Context<Initialize>,
    thread_id: Vec<u8>,
    holder_name: String,
    balance: f64,
) -> Result<()> {
    let system_program = &ctx.accounts.system_program;
    let clockwork_program = &ctx.accounts.clockwork_program;

    let holder = &ctx.accounts.holder;
    let bank_account = &mut ctx.accounts.bank_account;

    let thread = &ctx.accounts.thread;
    let thread_authority = &ctx.accounts.thread_authority;

    bank_account.thread_id = thread_id.clone();
    bank_account.holder = *holder.key;
    bank_account.balance = balance;
    bank_account.holder_name = holder_name;
    bank_account.created_at = Clock::get().unwrap().unix_timestamp;

    // Clockwork Target Instruction
    let target_ix = Instruction {
        program_id: ID,
        accounts: crate::accounts::AddInterest {
            bank_account: bank_account.key(),
            thread: thread.key(),
            thread_authority: thread_authority.key(),
        }
        .to_account_metas(Some(true)),
        data: crate::instruction::AddInterest {
            _thread_id: thread_id.clone(),
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
        AUTOMATION_FEE as u64 * LAMPORTS_PER_SOL,
        thread_id,
        vec![target_ix.into()],
        trigger,
    )?;

    Ok(())
}
```

This instruction takes in the unique thread id, account holder's name and the initial deposit amount as the `balance` parameter.

The important part is how our automation is defined and triggered. We need three things for Clockwork automation to work:
1. Target Instruction
2. Automation Trigger
3. CPI to Thread

We're targeting the `add_interest` instruction, and it's context `AddInterest` for our automation, we'll learn about them in detail later.

Then, we've defined our trigger, which is a simple cron job for us. It's using the `CRON_SCHEDULE` constant we defined earlier.

Finally, we're making a CPI to clockwork thread, starting at line 69.

> Note that in target_ix variable, we're getting `crate::accounts` and `crate::instructions` from Anchor directly at compile time. This is how we're able to get `AddInterest` context accounts and data required without having to import them or do anything else.
----

#### 3.1 Depositing Amount
Our deposit instruction is fairly simple, navigate to line 84:

```rs
pub fn deposit(ctx: Context<UpdateBalance>, _thread_id: Vec<u8>, amount: f64) -> Result<()> {
    if amount < 0.0 {
        return Err(error!(ErrorCode::AmountTooSmall));
    };

    let bank_account = &mut ctx.accounts.bank_account;
    bank_account.balance += amount;
    Ok(())
}
```
We're simply taking in the thread_id, that is being used in our `UpdateBalance` context as seed to derive our bank account and adding a balance.

We're first making sure deposit balance amount is not in negative using the if condition.

#### 3.2 Withdrawing Amount
Defined in line 94, our `withdraw` function is almost identical to the `deposit` function. We're just subtracting the amount instead of adding here.

#### 3.3 Adding Interest
We're using simple compound interest formula in our program to add interest. 
Head over to [program/programs/program/src/lib.rs](program/programs/program/src/lib.rs)
Check line 111:

```rs
pub fn add_interest(ctx: Context<AddInterest>, _thread_id: Vec<u8>) -> Result<()> {
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
```

Our `add_interest` instruction simply accepts a thread id, which is used in the context to derive our bank account.
We're essentially getting the time at which this instruction is called, subtracting it with bank's creation time to get time elasped, and then using compound interest formula to get our final `accumulated_value` and setting it to user's balance. We're also logging this using `msg` macro for debugging purposes.

### Client Code

Let's go through the code and understand how our client works.

1. Program setup
   - 1.1 Creating Anchor Provider
   - 1.2 Adding IDL

2. Calling instructions
   - 2.1 Deriving thread address using Clockwork SDK
   - 2.2 Depositing and Withdrawing
  
3. Fetching Data
   - 3.1 Fetching our bank accounts
   - 3.2 Filters in detail

#### 1.1 Creating Anchor Provider

To get started, we create an Anchor provider, which will interact with our Solana program. Go to [/app/src/util/helper.ts](/app/src/util/helper.ts)

We first create an anchor program provider that will help us interact with our program. Note that it takes in our `IDL`. We will understand more about the IDL next.

```ts
// Line 26

export const anchorProgram = (wallet: anchor.Wallet, network?: string) => {
  const provider = getProvider(wallet, network);
  const idl = IDLData as anchor.Idl;
  const program = new anchor.Program(
    idl,
    new PublicKey(DEVNET_PROGRAM_ID),
    provider
  ) as unknown as anchor.Program<IDLType>;

  return program;
};
```

#### 1.2 Adding IDL

When you build your program, in the `target/` directory, your program's IDL is created. IDL is essentially the structure of your entire program, including all instructions, instruction params and all accounts. The IDL is saved in a JSON file. 

We have to copy it in our client code and save it as a type so that we can easily work with our anchor provider with type annotations and checking. In this repository, the IDL is present in [/app/src/util/idl.ts](/app/src/util/idl.ts) file

We have to first copy the generated IDL JSON from our program's `target/` directory, and paste it as `IDLType` in our client. This will be the type for our IDL Data. Then, define the `IDLData` variable with the exact same IDL JSON, and add the `IDLType` to our `IDLData` object's type. That's it!.

----

#### 2.1 Deriving thread address using Clockwork SDK
We have to first install Clockwork SDK. You can do it by typing `yarn add @clockwork-xyz/sdk`.
Now, open up [/app/src/util/program/openAccount.ts](/app/src/util/program/openAccount.ts)
Check line 14:

```ts
const clockworkProvider = ClockworkProvider.fromAnchorProvider(
    program.provider as anchor.AnchorProvider
);

const threadId = "bank_account-" + new Date().getTime() / 1000;

const [bank_account] = PublicKey.findProgramAddressSync(
    [Buffer.from("bank_account"), Buffer.from(threadId)],
    program.programId
);

const [threadAuthority] = PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode("authority")],
    program.programId
);
const [threadAddress] = clockworkProvider.getThreadPDA(
    threadAuthority,
    threadId
);
```
We are first defining Clockwork provider. Just like our Anchor provider, we would need Clockwork provider to derive thread address.

Then, we are generating a unique thread ID. Using it as seed and the string "bank_account", we're then deriving our bank_account PDA

Next, we're deriving threadAuthority PDA using the string "authority". We're then using this "authority" PDA and unique thread ID to derive a `threadAddress` using Clockwork's provider

#### 2.2 Depositing and Withdrawing
Open up [/app/src/util/program/addBalance.ts](/app/src/util/program/addBalance.ts)
We're simply passing the unique `threadId` and our bank account PDA, along with the amount we want to deposit.
Check ine 19:
```ts
const sig = await program.methods.deposit(Buffer.from(threadId), balance)
    .accounts({
        bankAccount: bank_account,
        holder: wallet.publicKey,
        
    }).rpc()
```

Now, open [/app/src/util/program/removeBalance.ts](/app/src/util/program/removeBalance.ts)
You'll notice that just like how our withdraw and deposit program instructions were very similar, our clients are also pretty much the same.


----

#### 3.1 Fetching our Bank Account
Now, it's the time we fetch our bank accounts. A user can have multiple bank accounts, just like in real world, we are not categorizing them like real world for simplicity.

Open [/app/src/util/program/getBankAccount.ts](/app/src/util/program/getBankAccount.ts)
Notice Line 11:

```ts
const data = await program.account.bankAccount.all([
    {
    memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() }
    }
])
```

Anchor provides us `.all()` and .fetch() methods. One returns all bank accounts, other returns an individual bank account through it's public key. But what about adding some filtering to fetch accouts by some specific attribute, like the owner?

Look at the array in the code snippet above.

Under the hood, `all` method is calling Solana JSON RPC's `getProgramAccounts` method. You can check out [Solana CookBook's Guide](https://solanacookbook.com/guides/get-program-accounts.html#facts) to understand it in more depth!

But for now, to keep it simple. The `memcmp` filter, standing for memory comparison helps us comparing specific value in bytes on its position. 

#### 3.2 Filters in detail

We define our account space according to this [Space Reference](https://book.anchor-lang.com/anchor_references/space.html).

Let's have a look at our Bank Account Struct again from Rust:
```rs
pub struct BankAccount {
    pub holder: Pubkey,
    pub holder_name: String,
    pub balance: f64,
    pub thread_id: Vec<u8>,
    pub created_at: i64,
    pub updated_at: i64,
}
```

The first `8` byte space is for discriminator, we have to add it every time when fetching data. Then, we have specific byte values for all values in our account struct. In order to get the value `holder`, which is after discriminator, we need to shift bytes by 8. That is the **offset** you see in the TypeScript code snippet in the [section above](#31-fetching-our-bank-account)

We just need to define the correct offset for the byte data we are looking at, and then add the actual byte data itself, which is the user's public key in this case.

And that is it! It's that easy to fetch particular accounts through filters. If we wanted to get let's say, all bank accounts with balance 100, we would just need to add 8 + (4 + 12) offset and enter our amount in bytes!


