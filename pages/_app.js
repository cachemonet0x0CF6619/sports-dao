import '../styles/globals.css';

import { ThirdwebWeb3Provider } from '@3rdweb/hooks'
import Footer from '../components/Footer'

// Rinkeby
const supportedChainIds = [4]

const connectors = {
  injected: {}
}

function Dapp({ Component, pageProps }) {
  return (
    <ThirdwebWeb3Provider
      connectors={connectors}
      supportedChains={supportedChainIds}
    >
      <Component {...pageProps} />
      <Footer />
    </ThirdwebWeb3Provider>
  )
}

export default Dapp;
