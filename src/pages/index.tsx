import Head from 'next/head';
import { View } from '../components/layout/View';

const Home = () => {
  return (
    <>
      <Head>
        <title>Marai Hybrid HUD</title>
        <meta name="description" content="Hybrid HUD canvas + DOM overlay aligned to MOA_AI_V3" />
      </Head>
      <View />
    </>
  );
};

export default Home;
