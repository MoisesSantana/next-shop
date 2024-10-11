import { AppProps } from "next/app"
import { globalStyles } from "../styles/global"
import logo from '../assets/logo.svg';
import * as Styles from "../styles/pages/app";
import Image from "next/image";

globalStyles();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Styles.Container>
      <Styles.Header>
        <Image src={logo} alt="" />
      </Styles.Header>
      <Component {...pageProps} />
    </Styles.Container>
  )
}
