import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Button, Divider, Flex, Input, Text, useToast } from '@chakra-ui/react'
import { Navbar } from '@/components/Navbar'
import { useEffect, useState } from 'react'
import { openBankAccount } from '@/util/program/openAccount'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet'
import { useRouter } from 'next/router'
import { getBankAccount } from '@/util/program/getBankAccount'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [data, setData] = useState<any>()
  const wallet = useAnchorWallet()
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    if (!wallet) return
    const run = async () => {
      const { sig, error } = await getBankAccount(wallet as NodeWallet)
      if (error) return
      console.log(sig, error)
      setData(sig)
    }

    run()
  }, [wallet])



  return (
    <>
      <Head>
        <title>Solana Bank Simulator | Dashboard</title>
        <meta name="description" content="Bank Simulator dApp with automated interest using Clockwork" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <Flex gap="1rem" bg="#05070D" justify="space-around"align="center" minH="100vh" h="100%" p="0 5rem">

        <Flex minH="50vh" p="2rem" gap="2rem" borderRadius="20px" bg="#0A0E1A" width="45%" flexFlow="column" justify="center" align="center">

          {data && <Text mt="40px" fontSize="40px" color="white" fontWeight={700}>Welcome, {data.holderName}</Text>}
          <Divider borderColor="#242D45" />

          <Text color="#4A526D" fontSize="30px">Balance</Text>
          {data && <Text color="white" fontSize="40px">${data.balance}</Text>}

          <Divider borderColor="#242D45" />
          <Text fontSize="30px" fontWeight={500} color="#898DA4">Earning 2.5% annually</Text>
          <Text fontSize="30px" fontWeight={400} color="#464854">Balance updating every 10 seconds</Text>
        </Flex>

        <Flex minH="50vh" p="2rem" gap="2rem" borderRadius="20px" bg="#0A0E1A" width="45%" flexFlow="column" justify="center" align="center">

         
        </Flex>


      </Flex>


    </>
  )
}
