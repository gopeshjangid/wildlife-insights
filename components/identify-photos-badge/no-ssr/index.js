import dynamic from 'next/dynamic';

export default dynamic(() => import('components/identify-photos-badge'), {
  ssr: false,
  loading: () => null
});
