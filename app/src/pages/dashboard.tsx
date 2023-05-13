import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Box, Button, Divider, Flex, Input, Menu, MenuButton, MenuItem, MenuList, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text, useToast } from '@chakra-ui/react'
import { Navbar } from '@/components/Navbar'
import { useEffect, useState } from 'react'
import { openBankAccount } from '@/util/program/openAccount'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet'
import { useRouter } from 'next/router'
import { getBankAccount } from '@/util/program/getBankAccount'
import { closeBankAccount } from '@/util/program/closeBankAccount'
import { addBalance } from '@/util/program/addBalance'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { anchorProgram } from '@/util/helper'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [accounts, setAccounts] = useState<any[]>([])

  const [currentAccount, setCurrentAccount] = useState<any>()

  const wallet = useAnchorWallet()
  const router = useRouter()
  const toast = useToast()
  const [num, setNum] = useState<number>(0)

  useEffect(() => {
    if (!wallet) return

    const run = async () => {
      const { sig, error } = await getBankAccount(wallet as NodeWallet)
      if (error) return
      console.log(sig)
      setAccounts(sig)
      setCurrentAccount(sig.find((s: any) => s.threadId == router.query.default))
    }
    run()

  }, [wallet])


  useEffect(() => {

    if (!currentAccount) return
    const run = async () => {
      // @ts-ignore
      const newData = await anchorProgram(wallet as NodeWallet).account.bankAccount.fetch(currentAccount.pubKey)
      console.log("Fresh Data: ", newData)
      setCurrentAccount({
        balance: newData.balance,
        createdAt: newData.createdAt.toNumber(),
        holderName: newData.holderName,
        updatedAt: newData.updatedAt.toNumber(),
        threadId: newData.threadId ? Buffer.from(newData.threadId).toString() : '',
        pubKey: currentAccount.pubKey,
      })
    }

    const interval = setInterval(() => {
      run()
    }, 10000)

    return () => clearInterval(interval)

  }, [currentAccount])

  const onDeposit = async () => {
    const res = await addBalance(wallet as NodeWallet, currentAccount.threadId, num)
    console.log(res)
  }

  const onDelete = async () => {
    const res = await closeBankAccount(
      wallet as NodeWallet,
      currentAccount.threadId
    )
    console.log(res)

    if (res.error) {
      toast({
        status: "error",
        title: res.error
      })
    } else {
      toast({
        status: "success",
        title: "Sig: " + res.sig
      })
      router.push("/")
    }
  }

  const onWithdraw = async () => {

  }

  return (
    <>
      <Head>
        <title>Solana Bank Simulator | Dashboard</title>
        <meta name="description" content="Bank Simulator dApp with automated interest using Clockwork" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <Flex gap="1rem" bg="#05070D" align="center" minH="100vh" h="100%" p="0 5rem" overflow="hidden" flexFlow="column">

        <Menu>
          <MenuButton mt="5rem" w="30rem" h="4rem" bg="blue.400" color="white" as={Button} fontSize="1.8rem" _hover={{ bg: "blue.300" }} rightIcon={<ChevronDownIcon />}>
            Select Account
          </MenuButton>

          <MenuList bg="blue.500">
            {accounts && accounts.map((acc) => (
              <MenuItem w="30rem" key={acc.createdAt} color="gray.500" onClick={() => setCurrentAccount(acc)} bg="blue.500" border="1px solid" borderColor="blue.400">
                <Flex fontSize="1.2rem" justify="space-between" w="100%">
                  <Text color="gray.200">{acc.holderName}</Text>
                  <Text color="gray.200">Balance: ${acc.balance}</Text>
                </Flex>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <Flex gap="1rem" bg="#05070D" justify="space-around" align="center" w="100%">

          <Flex minH="50vh" p="2rem" gap="2rem" borderRadius="20px" bg="#0A0E1A" width="45%" flexFlow="column" justify="center" align="center">

            <Text mt="40px" fontSize="40px" color="white" fontWeight={700}>Welcome, {currentAccount ? currentAccount.holderName : "..."}</Text>
            <Divider borderColor="#242D45" />

            <Flex align="center" justify="space-around" w="100%">
              <Box>
                <Text color="#4A526D" fontSize="30px">Balance</Text>
                <Text color="white" fontSize="50px" fontWeight={700}>${currentAccount ? currentAccount.balance : "..."}</Text>
              </Box>

            </Flex>

            <Divider borderColor="#242D45" />
            <Text fontSize="30px" fontWeight={500} color="#898DA4">Earning 2.5% minute return</Text>
            <Text fontSize="30px" fontWeight={400} color="#464854" fontStyle="italic">Balance updating every 10 seconds</Text>
          </Flex>

          <Flex minH="50vh" p="2rem" gap="2rem" borderRadius="20px" bg="#0A0E1A" width="45%" flexFlow="column" justify="center" align="center">


            <NumberInput onChange={(e) => setNum(Number(e))} w="60%" min={0}>
              <NumberInputField min={0} placeholder='Enter amount' color="white" fontSize="20px" border="1px solid #30354F" bg="transparent" height="50px" w="100%" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Button onClick={onDeposit} colorScheme='messenger' fontSize="2rem" w="60%" h="4rem">Deposit Funds</Button>
            <Divider borderColor="#242D45" />

            <Button onClick={onWithdraw} colorScheme='messenger' fontSize="2rem" w="60%" h="4rem">Withdraw Funds</Button>
            <Divider borderColor="#242D45" />

            <Button onClick={onDelete} colorScheme='red' fontSize="2rem" w="60%" h="4rem">Close Account</Button>
          </Flex>
        </Flex>
      </Flex >


    </>
  )
}
