import { FullProjectStoryboard } from './components/FullProjectStoryboard';

export const FullStoryboardPage = () => {
  return <FullProjectStoryboard onExit={() => window.history.back()} />;
};
