import { ProjectPlanner } from "@/components/ProjectPlanner";
import { plannerConfig } from "@/config/client-config";

export default function HomepagePlanner() {
  return <ProjectPlanner config={plannerConfig} embedded />;
}
