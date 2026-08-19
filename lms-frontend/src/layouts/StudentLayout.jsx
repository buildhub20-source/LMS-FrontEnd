import StudentNavigation from '../components/navigation/StudentNavigation';
import AppShell from './AppShell';

export const StudentLayout = () => <AppShell title="Learning" navigation={<StudentNavigation />} />;

export default StudentLayout;
