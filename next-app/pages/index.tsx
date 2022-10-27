import type { NextPage } from 'next'
import Head from 'next/head'
import Web3Modal from 'web3modal'
import { providers, Contract } from 'ethers'
import { useEffect, useRef, useState } from 'react'
import { WHITELIST_CONTRACT_ADDRESS, abi } from '../constants'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
// import { WHITELIST_CONTRACT_ADDRESS, abi } from '../constants'

const Home: NextPage = () => {
  const [walletConnected, setWalletConnected] = useState<boolean>(false)
  const [joinedAllowlist, setJoinedAllowlist] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState<number>(0)
  const web3modalRef = useRef<Web3Modal>()

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3modalRef.current?.connect()
    const web3Provider = new providers.Web3Provider(provider)

    const { chainId } = await web3Provider.getNetwork()
    if (chainId !== 5) {
      window.alert('Change network to Goerli')
      throw new Error('Change network to Goerli')
    }

    if (needSigner) {
      const signer = web3Provider.getSigner()
      console.log(signer)
      return signer
    }

    return web3Provider
  }

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true)

      const allowlistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const tx = await allowlistContract.addAddressToWhitelist()
      setIsLoading(true)
      await tx.wait
      setIsLoading(false)

      await getNumberOfWhiteListed()
      setJoinedAllowlist(true)
    } catch (e) {
      console.log(e)
    }
  }

  const getNumberOfWhiteListed = async () => {
    try {
      const provider = await getProviderOrSigner()
      const allowlistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      )
      const _numberOfWhitelisted =
        await allowlistContract.numAddressesWhitelisted()
      setNumberOfWhitelisted(_numberOfWhitelisted)
    } catch (e) {
      console.log(e)
    }
  }
  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const allowlistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )
      const address = await signer.getAddress()
      const _joinedAllowlist = await allowlistContract.whitelistedAddresses(
        address
      )
      setJoinedAllowlist(_joinedAllowlist)
    } catch (err) {
      console.error(err)
    }
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner()
      setWalletConnected(true)

      checkIfAddressInWhitelist()
      getNumberOfWhiteListed()
    } catch (err) {
      console.error(err)
    }
  }
  const renderButton = () => {
    if (walletConnected) {
      if (joinedAllowlist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        )
      } else if (isLoading) {
        return <button className={styles.button}>Loading...</button>
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        )
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      )
    }
  }
  useEffect(() => {
    if (!walletConnected) {
      web3modalRef.current = new Web3Modal({
        network: 'goerli',
        providerOptions: {},
        disableInjectedProvider: false
      })
      connectWallet()
    }
  }, [walletConnected])

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  )
}

export default Home
