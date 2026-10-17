import InstructorNavigation from '../components/navigation/InstructorNavigation';
import AppShell from './AppShell';

export const InstructorLayout = () => (
  <AppShell title="Teaching" navigation={<InstructorNavigation />} />
);

export default InstructorLayout;
