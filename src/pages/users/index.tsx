import { Box, Button, Flex, Heading, Icon, Table, Thead, Tr, Th, Checkbox, 
  Tbody, Td, Text, useBreakpointValue, Spinner, Link } from "@chakra-ui/react"
import NextLink from "next/link"
import { RiAddLine } from "react-icons/ri"
import Header from "../../components/Header"
import { Pagination } from "../../components/Pagination"
import { Sidebar } from "../../components/Sidebar/index"
import { QueryClient, useQuery } from 'react-query'
import { api } from "../../services/api"
import { getUsers, useUsers } from "../../services/hooks/useUsers"
import { useState } from "react"
import { queryClient } from "../../services/queryClient"
import { GetServerSideProps } from "next"


export default function UserList({ users }){
  const [page, setPage] = useState (1)
  const { data, isLoading, isFetching, error } = useUsers(page, {
    initialData: users,
  })

  const isWideVersion = useBreakpointValue({
    base: false,
    lg: true
  })

  async function handlePrefetchUser(userId: number){
    await queryClient.prefetchQuery(['user', userId], async () => {
      const response = await api.get(`users/${userId}`)

      return response.data
    },{
      staleTime: 1000 * 50 * 10
    })
  }

  return(
    <Box>
      <Header />

      <Flex w='100%' maxWidth={1480} mx='auto' px='6'>
        <Sidebar/>

        <Box flex='1' borderRadius={8} bg='gray.800'p='8'>
          <Flex mb='8' justify='space-between' align='center'>
            <Heading size='lg' fontWeight='normal'>Usuários
            { !isLoading && isFetching && <Spinner size='sm' color='gray.500'/>}
            </Heading>

            <NextLink href='/users/create'>
              <Button 
              as='a' 
              size='sm' 
              fontSize='sm' 
              colorScheme='pink' 
              leftIcon={<Icon as={RiAddLine} fontSize='20'/>}>
                Criar novo
              </Button>
            </NextLink>
            
          </Flex>

          { isLoading ? (
            <Flex justify='center'>
              <Spinner />
            </Flex>
          ) : error ? (
            <Flex> 
              <Text>Falha ao obter dados os usuários.</Text>
            </Flex>
          ) : (
            <>
              <Table colorScheme='whiteAlpha'>
              <Thead>
                <Tr>
                  <Th px={['4', '4', '6']} color='gray.300' width='8'>
                    <Checkbox colorScheme='pink' />
                  </Th>
                  { isWideVersion && <Th>Usuário</Th> }
                  <Th>Data de cadastro</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.users.map(user => {
                  return(
                    <Tr key={user.id}>
                      <Td px={['4', '4', '6']}>
                        <Checkbox colorScheme='pink' />
                      </Td>
                      <Td>
                        <Box>
                          <Link color="purple.400" onMouseEnter={() => handlePrefetchUser(user.id)}>
                            <Text fontWeight="bold">{user.name}</Text>
                          </Link>
                          <Text fontSize='sm' color='gray.300'>{user.email}</Text>
                        </Box>
                      </Td>{ isWideVersion && <Td>{user.createdAt}</Td> }     
                    </Tr>
                  )
                })}
              </Tbody>
              </Table>

              <Pagination 
              totalCountOfRegisters={200} 
              currentPage={page} 
              onPageChange={setPage}/>
            </>
          )}
        </Box>
      </Flex>
    </Box>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { users, totalCount} = await getUsers(1)

  return{
    props: {
      users,
    }
  }
}