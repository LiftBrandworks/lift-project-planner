import { ProjectPlanner } from "@/components/ProjectPlanner";
import { plannerConfig } from "@/config/client-config";

export default function Home() {
  return <ProjectPlanner config={plannerConfig} />;
}
