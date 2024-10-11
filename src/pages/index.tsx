import Image from 'next/image';
import * as Styles from '../styles/pages/home';
import { useKeenSlider } from 'keen-slider/react';

import 'keen-slider/keen-slider.min.css';
import { stripe } from '../lib/stripe';
import { GetStaticProps } from 'next';
import Stripe from 'stripe';
import Link from 'next/link';
import Head from 'next/head';
import { Fragment } from 'react';

interface HomeProps {
  products: {
    id: string;
    name: string;
    image: string;
    description: string;
    price: number;
  }[];
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    },
  });

  return (
    <Fragment>
      <Head>
        <title>Home | Next Shop</title>
      </Head>

      <Styles.Container ref={sliderRef} className="keen-slider">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`product/${product.id}`}
            prefetch={false}
          >
            <Styles.Product className="keen-slider__slide">
              <Image src={product.image} width={520} height={400} alt='' />
              <footer>
                <strong>{product.name}</strong>
                <span>{product.price}</span>
              </footer>
            </Styles.Product>
          </Link>
        ))}
      </Styles.Container>
    </Fragment>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
  });

  const products = response.data.map((product) => {
    const price = product.default_price as Stripe.Price;

    return {
      id: product.id,
      name: product.name,
      image: product.images[0],
      description: product.description,
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: price.currency,
      }).format(price.unit_amount / 100),
    };
  });

  return {
    props: { products },
    revalidate: 60 * 60 * 2 // 2 hours,
  };
}
