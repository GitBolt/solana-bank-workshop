import Head from 'next/head'
import { Box, Button, Divider, Flex, Menu, MenuButton, MenuItem, MenuList, Text, useToast } from '@chakra-ui/react'
import { Navbar } from '@/components/Navbar'
import { useEffect, useState } from 'react'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { useRouter } from 'next/router'
import { getBankAccount } from '@/util/program/getBankAccount'
import { addBalance } from '@/util/program/addBalance'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { anchorProgram } from '@/util/helper'
import { removeBalance } from '@/util/program/removeBalance'
import { ActionBox } from '@/components/ActionBox'
import { deleteAccount } from '@/util/program/deleteBankAccount'


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
      try {
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
      } catch (e) {
        console.log(e)
      }
    }

    const interval = setInterval(() => {
      run()
    }, 5000)

    return () => clearInterval(interval)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount])

  const onDeposit = async () => {
    const res = await addBalance(wallet as NodeWallet, currentAccount.threadId, num)
    if (res.error) {
      toast({
        status: "error",
        title: res.error
      })
      return
    }

    toast({
      status: "success",
      title: "Tx: " + res.sig
    })
  }

  const onWithdraw = async () => {
    const res = await removeBalance(wallet as NodeWallet, currentAccount.threadId, num)
    if (res.error) {
      toast({
        status: "error",
        title: res.error
      })
      return
    }

    toast({
      status: "success",
      title: "Tx: " + res.sig
    })
  }

  const onDelete = async () => {
    const res = await deleteAccount(wallet as NodeWallet, currentAccount.threadId)
    if (res.error) {
      toast({
        status: "error",
        title: res.error
      })
      return
    }

    toast({
      status: "success",
      title: "Tx: " + res.sig
    })
    router.push("/")
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

      <Flex overflow="hidden" gap="1rem" bg="#05070D" align="center" minH="100vh" h="100%" p="0 5rem" flexFlow="column">

        <Menu preventOverflow>
          <MenuButton mt="5rem" w="25rem" h="3rem" bg="blue.600" color="white" as={Button} fontSize="1.8rem" _hover={{ bg: "blue.300" }} rightIcon={<ChevronDownIcon />}>
            Select Account
          </MenuButton>

          <MenuList bg="blue.600" p="0" border="0px" borderRadius="2rem">
            {accounts && accounts.map((acc) => (
              <MenuItem w="25rem" key={acc.createdAt} h="3rem" color="gray.500" onClick={() => setCurrentAccount(acc)} bg="gray.700" border="1px solid" borderColor="gray.600">
                <Flex fontSize="1.2rem" justify="space-between" w="100%">
                  <Text color="gray.200" >{acc.holderName}</Text>
                  <Text color="gray.200">Balance: ${Math.round(acc.balance * 10000) / 10000}</Text>
                </Flex>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        <Flex gap="1rem" bg="#05070D" justify="space-around" align="center" w="100%">

          <Box bg="#0A0E1A" p="2rem" borderRadius="20px" width="45%" minH="60vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" boxShadow="md">
            <Text mt="40px" fontSize="3rem" fontWeight="bold" color="white" textAlign="center">Welcome, {currentAccount ? currentAccount.holderName : "..."}</Text>
            <Divider borderColor="#242D45" my="2rem" />
            <Flex justify="center" w="100%">
              <Box mr="3rem" textAlign="center">
                <Text color="#4A526D" fontSize="4xl" fontWeight="semibold" mb="0.5rem">Balance</Text>
                <Text color="white" fontSize="3rem" fontWeight="bold">${currentAccount ? Math.round(currentAccount.balance * 10000) / 10000 : "..."}</Text>
              </Box>
            </Flex>
            <Divider borderColor="#242D45" my="2rem" />
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="semibold" color="#898DA4" mb="0.5rem">Earning 5% minute return</Text>
              <Text fontSize="3xl" fontWeight="light" color="#464854" fontStyle="italic">Balance updating every 10 seconds</Text>
            </Box>
          </Box>


          <ActionBox
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
            setNum={setNum}
            onDelete={onDelete}
          />
        </Flex>
      </Flex >


    </>
  )
}
