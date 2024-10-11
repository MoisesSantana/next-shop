import { useRouter } from "next/router"
import * as Styles from "../../styles/pages/product"
import { GetStaticPaths, GetStaticProps } from "next";
import { stripe } from "../../lib/stripe";
import Stripe from "stripe";
import Image from "next/image";
import axios from "axios";
import { Fragment, useState } from "react";
import Head from "next/head";

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    description: string;
    price: string;
    defaultPriceId: string;
  }
}

export default function Product({ product }: ProductProps) {
  const [isFetchingCheckout, setIsFetchingCheckout] = useState(false);
  const { isFallback } = useRouter();

  if (isFallback || isFetchingCheckout) {
    return <p>Carregando...</p>
  }

  async function handleBuyProduct() {
    try {
      setIsFetchingCheckout(true);
      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      });

      const { checkoutUrl } = response.data;
      window.location.href = checkoutUrl;
    } catch (error) {
      setIsFetchingCheckout(false);
      alert('Falha ao realizar compra');
    }
  }

  return (
    <Fragment>
      <Head>
        <title>{product.name} | Next Shop</title>
      </Head>

      <Styles.Container>
        <Styles.ImageContainer>
          <Image src={product.imageUrl} width={520} height={400} alt='' />
        </Styles.ImageContainer>
        <Styles.Details>
          <h1>{product.name}</h1>
          <span>{product.price}</span>
          <p>{product.description}</p>
          <button
            disabled={isFetchingCheckout}
            onClick={handleBuyProduct}
          >
            Comprar agora
          </button>
        </Styles.Details>
      </Styles.Container>
    </Fragment>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { id: 'prod_R0PVOazJ1UG6jt' } }
    ],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
  const { id } = params;
  const product = await stripe.products.retrieve(id, {
    expand: [ 'default_price']
  })

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        id,
        name: product.name,
        imageUrl: product.images[0],
        description: product.description,
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: price.currency,
        }).format(price.unit_amount / 100),
        defaultPriceId: price.id,
      }
    },
    revalidate: 60 * 60 * 1, // 1 hour
  };
}
