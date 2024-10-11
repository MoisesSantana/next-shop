import Link from "next/link";
import * as Styles from "../styles/pages/success";
import { GetServerSideProps } from "next";
import { stripe } from "../lib/stripe";
import Stripe from "stripe";
import Image from "next/image";
import { Fragment } from "react";
import Head from "next/head";

interface SuccessPage {
  customerName: string;
  product: {
    name: string;
    image: string;
  }
}

export default function Success({ customerName, product }: SuccessPage) {
  return (
    <Fragment>
      <Head>
        <title>Compra Efetuada | Next Shop</title>

        <meta name="robots" content="noindex" />
      </Head>

      <Styles.Container>
        <h1>Compra Efetivada!</h1>

        <Styles.ImageContainer>
          <Image src={product.image} width={120} height={110} alt="Compra Efetuada" />
        </Styles.ImageContainer>

        <p>Obrigado, <strong>{customerName}</strong>! <strong>{product.name}</strong> já está a caminho</p>
        
        <Link href="/">
          Voltar ao catálago
        </Link>
      </Styles.Container>
    </Fragment>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.session_id) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const sessionId = String(query.session_id);

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product']
  });

  const customerName = session.customer_details.name;
  const product = session.line_items.data[0].price.product as Stripe.Product;

  return {
    props: {
      customerName,
      product: {
        name: product.name,
        image: product.images[0],
      }
    }
  }
}