import dynamic from 'next/dynamic';

// The NavDrawer is not a component that is critical to the app
// and it needs a few queries in order to render
// For these reasons, it is loaded asynchronously and in the browser
export default dynamic(() => import('./component'), { ssr: false, loading: () => null });
