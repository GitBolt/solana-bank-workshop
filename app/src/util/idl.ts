export type IDLType = {
  "version": "0.1.0",
  "name": "bank",
  "instructions": [
    {
      "name": "initializeAccount",
      "accounts": [
        {
          "name": "bankAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The counter account to initialize."
          ]
        },
        {
          "name": "clockworkProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The Clockwork thread program."
          ]
        },
        {
          "name": "holder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The Solana system program."
          ]
        },
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Address to assign to the newly created thread."
          ]
        },
        {
          "name": "threadAuthority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The pda that will own and manage the thread."
          ]
        }
      ],
      "args": [
        {
          "name": "threadId",
          "type": "bytes"
        },
        {
          "name": "holderName",
          "type": "string"
        },
        {
          "name": "balance",
          "type": "f64"
        }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "holder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bankAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "threadId",
          "type": "bytes"
        },
        {
          "name": "amount",
          "type": "f64"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "holder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bankAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "threadId",
          "type": "bytes"
        },
        {
          "name": "amount",
          "type": "f64"
        }
      ]
    },
    {
      "name": "addInterest",
      "accounts": [
        {
          "name": "bankAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "thread",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "threadAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "threadId",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "removeInterest",
      "accounts": [
        {
          "name": "holder",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The signer."
          ]
        },
        {
          "name": "clockworkProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The Clockwork thread program."
          ]
        },
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The thread to reset."
          ]
        },
        {
          "name": "threadAuthority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The pda that owns and manages the thread."
          ]
        },
        {
          "name": "bankAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Close the counter account"
          ]
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "BankAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "holder",
            "type": "publicKey"
          },
          {
            "name": "holderName",
            "type": "string"
          },
          {
            "name": "balance",
            "type": "f64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "threadId",
            "type": "bytes"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AmountTooSmall",
      "msg": "Amount must be greater than zero"
    },
    {
      "code": 6001,
      "name": "AmountTooBig",
      "msg": "Withdraw amount cannot be less than deposit"
    }
  ]
}
export const IDLData: IDLType = {
  "version": "0.1.0",
  "name": "bank",
  "instructions": [
    {
      "name": "initializeAccount",
      "accounts": [
        {
          "name": "bankAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The counter account to initialize."
          ]
        },
        {
          "name": "clockworkProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The Clockwork thread program."
          ]
        },
        {
          "name": "holder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The Solana system program."
          ]
        },
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Address to assign to the newly created thread."
          ]
        },
        {
          "name": "threadAuthority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The pda that will own and manage the thread."
          ]
        }
      ],
      "args": [
        {
          "name": "threadId",
          "type": "bytes"
        },
        {
          "name": "holderName",
          "type": "string"
        },
        {
          "name": "balance",
          "type": "f64"
        }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "holder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bankAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "threadId",
          "type": "bytes"
        },
        {
          "name": "amount",
          "type": "f64"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "holder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bankAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "threadId",
          "type": "bytes"
        },
        {
          "name": "amount",
          "type": "f64"
        }
      ]
    },
    {
      "name": "addInterest",
      "accounts": [
        {
          "name": "bankAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "thread",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "threadAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "threadId",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "removeInterest",
      "accounts": [
        {
          "name": "holder",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The signer."
          ]
        },
        {
          "name": "clockworkProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The Clockwork thread program."
          ]
        },
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The thread to reset."
          ]
        },
        {
          "name": "threadAuthority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The pda that owns and manages the thread."
          ]
        },
        {
          "name": "bankAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Close the counter account"
          ]
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "BankAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "holder",
            "type": "publicKey"
          },
          {
            "name": "holderName",
            "type": "string"
          },
          {
            "name": "balance",
            "type": "f64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "threadId",
            "type": "bytes"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AmountTooSmall",
      "msg": "Amount must be greater than zero"
    },
    {
      "code": 6001,
      "name": "AmountTooBig",
      "msg": "Withdraw amount cannot be less than deposit"
    }
  ]
}