import { HomePage } from "@/components/home/HomePage";
import { Quiz } from "@/components/quiz/Quiz";

// "/": the quiz, whose first-visit state is the home page (server-rendered and
// handed to the quiz as its intro).
export default function Home() {
  return <Quiz home={<HomePage />} />;
}
