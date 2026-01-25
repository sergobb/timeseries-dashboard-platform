import Container from '@/components/ui/Container';
import PageWrapper from '@/components/ui/PageWrapper';
import ProfileEditContent from '@/components/profile/ProfileEditContent';

export default function ProfileEditPage() {
  return (
    <PageWrapper>
      <Container maxWidth="2xl">
        <ProfileEditContent />
      </Container>
    </PageWrapper>
  );
}
