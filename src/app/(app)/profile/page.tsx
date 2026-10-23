import ProfileForm from "@/components/ProfileForm";
import Reveal from "@/components/Reveal";

export default function ProfilePage() {
  return (
    <div className="p-4 sm:p-6">
      <Reveal>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted">Your details and photo, shown in the side panel.</p>
      </Reveal>
      <Reveal className="mt-6">
        <ProfileForm />
      </Reveal>
    </div>
  );
}