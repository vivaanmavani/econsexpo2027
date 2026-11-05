import { Opening } from "@/components/v6/Opening";
import { Intro } from "@/components/Intro";
import { PhotoStory } from "@/components/v6/PhotoStory";
import { Past } from "@/components/v6/Past";
import { Events } from "@/components/v6/Events";
import { CoreTeam } from "@/components/CoreTeam";
import { Closing } from "@/components/v6/Closing";

export default function Home() {
  return (
    <>
      <Opening />
      <Intro />
      <PhotoStory />
      <Past />
      <Events />
      <CoreTeam />
      <Closing />
    </>
  );
}
