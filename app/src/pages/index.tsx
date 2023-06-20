import Head from 'next/head'
import { Button, Flex, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text, useToast } from '@chakra-ui/react'
import { Navbar } from '@/components/Navbar'
import { useState } from 'react'
import { openBankAccount } from '@/util/program/openAccount'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { useRouter } from 'next/router'
import { getBankAccount } from '@/util/program/getBankAccount'


export default function Home() {

  const [name, setName] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const wallet = useAnchorWallet()
  const router = useRouter()
  const toast = useToast()


  const handleSubmit = async () => {
    if (!amount || !name) {
      toast({
        status: "error",
        title: "Enter both name and amount"
      })
      return
    }
    if (!wallet) {
      toast({
        status: "error",
        title: "Connect Wallet Needed"
      })
      return
    }

    const res = await openBankAccount(
      wallet as NodeWallet,
      name,
      amount
    )
    console.log(res)
    if (res.error) {
      toast({
        status: "error",
        title: res.error
      })
      return
    } else {
      toast({
        status: "success",
        title: "Sig: " + res.sig
      })
      router.push("/dashboard?default=" + res.threadId)
    }
  }

  return (
    <>
      <Head>
        <title>Solana Bank Simulator</title>
        <meta name="description" content="Bank Simulator dApp with automated interest using Clockwork" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <Flex gap="1rem" bg="#05070D" align="center" flexFlow="column" minH="100vh" h="100%">

        <Text mt="40px" fontSize="40px" color="white" fontWeight={700}>Welcome to Solana Bank Simulator</Text>
        <Text fontSize="30px" fontWeight={700} color="#64667B">You’ll receive 5% interest returns minutely</Text>

        <Flex minH="50vh" gap="2rem" borderRadius="20px" bg="#0A0E1A" width="50vw" p="2rem" flexFlow="column" justify="center" align="center">

          <Flex flexFlow="column" w="80%">
            <Text fontSize="20px" color="#787792">Enter your Name</Text>
            <Input color="white" maxLength={12} fontSize="20px" onChange={(e) => setName(e.target.value)} border="1px solid #30354F" bg="transparent" height="50px" w="100%" />
          </Flex>

          <Flex flexFlow="column" w="80%">
            <Text fontSize="20px" color="#787792">Initial Deposit Amount</Text>

            <NumberInput onChange={(e) => setAmount(Number(e))} min={1}>
              <NumberInputField min={1} color="white" fontSize="20px" border="1px solid #30354F" bg="transparent" height="50px" w="100%" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Flex>

          <Button onClick={handleSubmit} h="60px" borderRadius="30px" w="40%" bg="#1959FC" fontSize="25px" color="white" _hover={{ bg: "#1959F0" }}>Create Account</Button>
        </Flex>
      </Flex>


    </>
  )
}
