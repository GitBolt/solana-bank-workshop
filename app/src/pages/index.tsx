import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Button, Flex, Input, Text } from '@chakra-ui/react'
import { Navbar } from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Solana Bank Simulator</title>
        <meta name="description" content="Bank Simulator dApp with automated interest using Clockwork" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <Flex  gap="1rem" bg="#05070D" align="center" flexFlow="column" minH="100vh" h="100%">

        <Text mt="40px" fontSize="40px" color="white" fontWeight={700}>Welcome to Solana Bank Simulator</Text>
        <Text fontSize="30px" fontWeight={700} color="#64667B">You’ll receive 2.5% interest returns annually</Text>

        <Flex  minH="50vh" gap="2rem" borderRadius="20px" bg="#0A0E1A" width="50vw" p="2rem" flexFlow="column" justify="center" align="center">

          <Flex flexFlow="column" w="80%">
            <Text fontSize="20px" color="#787792">Enter your Name</Text>
            <Input color="white" fontSize="20px" border="1px solid #30354F" bg="transparent" height="50px" w="100%" />
          </Flex>

          <Flex flexFlow="column" w="80%">
            <Text fontSize="20px" color="#787792">Initial Deposit Amount</Text>
            <Input color="white" fontSize="20px" border="1px solid #30354F" bg="transparent" height="50px" w="100%" />
          </Flex>

          <Button h="60px" borderRadius="30px" w="40%" bg="#1959FC" fontSize="25px" color="white" _hover={{ bg: "#1959F0" }}>Create Account</Button>
        </Flex>
      </Flex>


    </>
  )
}
