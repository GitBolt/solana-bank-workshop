import { Flex, LinkBox, Text } from "@chakra-ui/react"
import dynamic from "next/dynamic";
import Link from "next/link";
const Wallets = dynamic(() => import("../components/WalletButton"), { ssr: false });

export const Navbar = () => {
  return (
    <Flex zIndex="10" bg="#0B0F1C" h="1rem" w="100%" justify="space-between" align="center" p="9">

      <Link href="/">
        <LinkBox fontSize="1.2rem" color="blue.400" fontWeight={600} borderRadius="1rem">Expense Tracker</LinkBox>
      </Link>
      <Wallets />
    </Flex>
  )
}