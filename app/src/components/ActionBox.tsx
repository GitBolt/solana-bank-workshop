import { Box, Button, Divider, FormControl, FormLabel, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper } from "@chakra-ui/react"
import React from "react"


type Props = {
  setNum: React.Dispatch<React.SetStateAction<number>>
  onDeposit: React.Dispatch<React.SetStateAction<any>>
  onWithdraw: React.Dispatch<React.SetStateAction<any>>
  onDelete: React.Dispatch<React.SetStateAction<any>>
}
export const ActionBox = ({
  setNum,
  onDeposit,
  onWithdraw,
  onDelete
}: Props) => {
  return (
    <Box
      bg="gray.900"
      borderRadius="xl"
      boxShadow="xl"
      padding="6"
      width="full"
      maxW="xl"
      minH="60vh"
      mx="auto"
    >
      <FormControl>
        <FormLabel color="white" fontSize="lg">
          Deposit
        </FormLabel>
        <NumberInput
          precision={2}
          onChange={(e) => setNum(Number(e))}
          min={0.01}
          borderRadius="xl"
          colorScheme="green"
        >
          <NumberInputField
            placeholder="Enter amount"
            fontSize="lg"
            h='3rem'
            color="white"
            borderColor="gray.700"
            _hover={{ borderColor: "white" }}
            _focus={{ outline: "none", borderColor: "green.500" }}
          />
          <NumberInputStepper borderColor="gray.700">
            <NumberIncrementStepper
              borderColor="gray.700"
              _hover={{ bg: "green.500" }}
            />
            <NumberDecrementStepper
              borderColor="gray.700"
              _hover={{ bg: "green.500" }}
            />
          </NumberInputStepper>
        </NumberInput>
        <Button
          mt="4"
          colorScheme="green"
          borderRadius="xl"
          onClick={onDeposit}
          fontSize="2xl"
          width="60%"
          h="3.5rem"

        >
          Deposit Funds
        </Button>
      </FormControl>

      <Divider my="5" borderColor="gray.700" />

      <FormControl>
        <FormLabel color="white" fontSize="lg">
          Withdraw
        </FormLabel>
        <NumberInput
          precision={2}
          onChange={(e) => setNum(Number(e))}
          min={0.01}
          borderRadius="xl"
          colorScheme="red"
        >
          <NumberInputField
            placeholder="Enter amount"
            fontSize="lg"
            color="white"
            h='3rem'
            borderColor="gray.700"
            _hover={{ borderColor: "white" }}
            _focus={{ outline: "none", borderColor: "red.500" }}
          />
          <NumberInputStepper borderColor="gray.700">
            <NumberIncrementStepper
              borderColor="gray.700"
              _hover={{ bg: "red.500" }}
            />
            <NumberDecrementStepper
              borderColor="gray.700"
              _hover={{ bg: "red.500" }}
            />
          </NumberInputStepper>
        </NumberInput>
        <Button
          mt="4"
          colorScheme="blue"
          borderRadius="xl"
          onClick={onWithdraw}
          fontSize="2xl"
          width="60%"
          h="3.5rem"

        >
          Withdraw Funds
        </Button>
      </FormControl>


      <Divider my="5" borderColor="gray.700" />

      <FormControl>
        <FormLabel color="white" fontSize="lg">
          Delete Account
        </FormLabel>

        <Button
          mt="4"
          colorScheme="red"
          borderRadius="xl"
          onClick={onDelete}
          fontSize="2xl"
          width="60%"
          h="3.5rem"
        >
          Delete Account
        </Button>
      </FormControl>
    </Box>

  )
}